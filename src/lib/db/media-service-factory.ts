// lib/db/media-service-factory.ts
import { createFailResponse, createSuccessResponse, dbOperation, getMongooseParams } from "@/lib/db/utils";
import { Model, Document, UpdateQuery } from "mongoose";
import { DataQuery } from "@/server/models/schemas/data";
import { IMedia } from "@/server/models/Media";
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp'; // For image processing
import { v4 as uuidv4 } from 'uuid';
import {createModelResolver} from "@/lib/db/model-resolver";

// File upload configuration
export interface MediaUploadConfig {
    uploadDir: string;
    baseUrl: string; // Base URL for serving files
    maxFileSize: number;
    allowedMimeTypes: string[];
    generateThumbnails: boolean;
    thumbnailSizes: { width: number; height: number; suffix: string }[];
    generateBlurDataUrl: boolean;
}

// Default configuration
const defaultConfig: MediaUploadConfig = {
    uploadDir: 'uploads',
    baseUrl: '/api/media', // Will serve files at /api/media/[id]
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'video/mp4',
        'video/webm',
        'application/pdf'
    ],
    generateThumbnails: true,
    thumbnailSizes: [
        { width: 150, height: 150, suffix: 'thumb' },
        { width: 300, height: 300, suffix: 'medium' },
        { width: 800, height: 600, suffix: 'large' }
    ],
    generateBlurDataUrl: true
};

/**
 * Enhanced media service factory with file upload capabilities
 */
export const createMediaServiceFactory = <T extends Document>(
    defaultModel: Model<T>,
    customPath: string,
    entityName: string,
    config: Partial<MediaUploadConfig> = {}
) => {
    const modelCache = new Map<string, object>();
    const resolveModel = createModelResolver(defaultModel, customPath, modelCache);
    const entityNameLower = entityName.toLowerCase();
    const mediaConfig = { ...defaultConfig, ...config };

    // Utility functions
    const ensureUploadDir = async (mediaId: string) => {
        const uploadPath = path.join(mediaConfig.uploadDir, mediaId);
        await fs.mkdir(uploadPath, { recursive: true });
        return uploadPath;
    };

    const validateFile = (file: { size: number; mimetype: string }) => {
        if (file.size > mediaConfig.maxFileSize) {
            throw new Error(`File size exceeds maximum allowed size of ${mediaConfig.maxFileSize} bytes`);
        }
        if (!mediaConfig.allowedMimeTypes.includes(file.mimetype)) {
            throw new Error(`File type ${file.mimetype} is not allowed`);
        }
    };

    const generateThumbnails = async (
        filePath: string,
        mediaId: string,
        mimetype: string
    ): Promise<{ [key: string]: string }> => {
        if (!mediaConfig.generateThumbnails || !mimetype.startsWith('image/')) {
            return {};
        }

        const thumbnails: { [key: string]: string } = {};
        const uploadDir = path.join(mediaConfig.uploadDir, mediaId);

        for (const size of mediaConfig.thumbnailSizes) {
            const thumbnailName = `${size.suffix}.webp`;
            const thumbnailPath = path.join(uploadDir, thumbnailName);

            await sharp(filePath)
                .resize(size.width, size.height, { fit: 'cover' })
                .webp({ quality: 80 })
                .toFile(thumbnailPath);

            thumbnails[size.suffix] = `${mediaConfig.baseUrl}/${mediaId}?thumbnail=${size.suffix}`;
        }

        return thumbnails;
    };

    const generateBlurDataUrl = async (filePath: string, mimetype: string): Promise<string> => {
        if (!mediaConfig.generateBlurDataUrl || !mimetype.startsWith('image/')) {
            return '';
        }

        try {
            const buffer = await sharp(filePath)
                .resize(10, 10, { fit: 'cover' })
                .blur(1)
                .jpeg({ quality: 20 })
                .toBuffer();

            return `data:image/jpeg;base64,${buffer.toString('base64')}`;
        } catch (error) {
            console.error('Error generating blur data URL:', error);
            return '';
        }
    };

    const cleanupFiles = async (mediaEntity: IMedia) => {
        try {
            const uploadDir = path.dirname(mediaEntity.path);
            await fs.rm(uploadDir, { recursive: true, force: true });
        } catch (error) {
            console.error('Error cleaning up files:', error);
        }
    };

    // Base CRUD operations (same as generic factory)
    const baseMethods = {
        getAll: (type?: string) => {
            return dbOperation(async () => {
                const Model = await resolveModel(type);
                const entities = await Model.find().lean();
                return createSuccessResponse(entities);
            });
        },

        get: (query: URLSearchParams, type?: string) => {
            return dbOperation(async () => {
                const { sort, filters, limit, skip } = getMongooseParams(query);
                const Model = await resolveModel(type);
                const entities = await Model.find(filters)
                    .sort(sort)
                    .limit(limit)
                    .skip(skip)
                    .lean();
                return createSuccessResponse(entities);
            });
        },

        getBySlug: (slug: string, type?: string) => {
            return dbOperation(async () => {
                const Model = await resolveModel(type);
                const entity = await Model.findOne({ slug }).lean();
                if (!entity) {
                    return createFailResponse(`No ${entityNameLower} found with this slug`);
                }
                return createSuccessResponse(entity);
            });
        },

        getById: (id: string, type?: string) => {
            return dbOperation(async () => {
                const Model = await resolveModel(type);
                const entity = await Model.findById(id).lean();
                if (!entity) {
                    return createFailResponse(`No ${entityNameLower} found with this ID`);
                }
                return createSuccessResponse(entity);
            });
        },

        add: (values: Partial<IMedia>, type?: string) => {
            return dbOperation(async () => {
                const Model = await resolveModel(type);
                const entity = new Model(values);
                await entity.save();
                return createSuccessResponse(entity);
            });
        },

        update: (id: string, values: Partial<IMedia>, type?: string) => {
            return dbOperation(async () => {
                const Model = await resolveModel(type);
                const entity = await Model.findByIdAndUpdate(id, values as UpdateQuery<T>, { new: true });
                if (!entity) {
                    return createFailResponse(`No ${entityNameLower} found with this ID`);
                }
                return createSuccessResponse(entity);
            });
        },

        delete: (id: string, type?: string) => {
            return dbOperation(async () => {
                const Model = await resolveModel(type);
                const entity = await Model.findById(id) as IMedia;
                if (!entity) {
                    return createFailResponse(`No ${entityNameLower} found with this ID`);
                }

                // Clean up associated files
                await cleanupFiles(entity);

                // Delete the database record
                await Model.findByIdAndDelete(id);
                return createSuccessResponse(entity);
            });
        },

        getCount: (filters: DataQuery<T> = {}, type?: string) => {
            return dbOperation(async () => {
                const Model = await resolveModel(type);
                const count = await Model.countDocuments(filters);
                return createSuccessResponse({ count });
            });
        },

        exists: (filters: DataQuery<T>, type?: string) => {
            return dbOperation(async () => {
                const Model = await resolveModel(type);
                const exists = await Model.exists(filters);
                return createSuccessResponse({ exists: !!exists });
            });
        }
    };

    // Enhanced media-specific methods
    const mediaMethods = {
        // Upload single file
        uploadFile: (
            file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
            metadata: {
                title?: string;
                alt?: string;
                caption?: string;
                description?: string;
                tags?: string[];
            } = {},
            type?: string
        ) => {
            return dbOperation(async () => {
                validateFile(file);

                const mediaId = uuidv4();
                const uploadDir = await ensureUploadDir(mediaId);

                // Generate unique filename
                const ext = path.extname(file.originalname);
                const filename = `original${ext}`;
                const filePath = path.join(uploadDir, filename);

                // Save file
                await fs.writeFile(filePath, file.buffer);

                // Generate thumbnails
                const thumbnails = await generateThumbnails(filePath, mediaId, file.mimetype);

                // Generate blur data URL for images
                const blurDataUrl = await generateBlurDataUrl(filePath, file.mimetype);

                // Create database record matching your existing schema
                const mediaData: Partial<IMedia> = {
                    _id: mediaId,
                    filename,
                    title: metadata.title,
                    originalName: file.originalname,
                    path: filePath,
                    url: `${mediaConfig.baseUrl}/${mediaId}`,
                    size: file.size,
                    mimetype: file.mimetype,
                    alt: metadata.alt || '',
                    caption: metadata.caption || '',
                    blurDataUrl,
                    createdAt: new Date(),
                    metadata: {
                        description: metadata.description || '',
                        tags: metadata.tags || []
                    }
                };

                const Model = await resolveModel(type);
                const entity = new Model(mediaData);
                await entity.save();

                // Add thumbnail URLs to response
                const responseData = {
                    ...entity.toObject(),
                    thumbnails
                };

                return createSuccessResponse(responseData);
            });
        },

        // Upload multiple files
        uploadFiles: (
            files: Array<{ buffer: Buffer; originalname: string; mimetype: string; size: number }>,
            metadata: {
                title?: string;
                alt?: string;
                caption?: string;
                description?: string;
                tags?: string[];
            } = {},
            type?: string
        ) => {
            return dbOperation(async () => {
                const uploadedFiles = [];

                for (const file of files) {
                    try {
                        const result = await mediaMethods.uploadFile(file, metadata, type);
                        if (result.success) {
                            uploadedFiles.push(result.content);
                        }
                    } catch (error) {
                        console.error('Error uploading file:', file.originalname, error);
                    }
                }

                return createSuccessResponse(uploadedFiles);
            });
        },

        // Get file stream for serving
        getFileStream: (id: string, thumbnailType?: string, type?: string) => {
            return dbOperation(async () => {
                const Model = await resolveModel(type);
                const entity = await Model.findById(id) as IMedia;

                if (!entity) {
                    return createFailResponse(`No ${entityNameLower} found with this ID`);
                }

                let filePath = entity.path;
                let mimetype = entity.mimetype;

                // If thumbnail requested, try to find it
                if (thumbnailType) {
                    const uploadDir = path.dirname(entity.path);
                    const thumbnailPath = path.join(uploadDir, `${thumbnailType}.webp`);

                    try {
                        await fs.access(thumbnailPath);
                        filePath = thumbnailPath;
                        mimetype = 'image/webp';
                    } catch {
                        // Fallback to original file
                        filePath = entity.path;
                        mimetype = entity.mimetype;
                    }
                }

                return createSuccessResponse({
                    filePath,
                    mimetype,
                    filename: entity.filename,
                    originalName: entity.originalName,
                    size: entity.size
                });
            });
        },

        // Replace file (keep same ID and metadata, replace file)
        replaceFile: (
            id: string,
            file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
            type?: string
        ) => {
            return dbOperation(async () => {
                validateFile(file);

                const Model = await resolveModel(type);
                const entity = await Model.findById(id) as IMedia;

                if (!entity) {
                    return createFailResponse(`No ${entityNameLower} found with this ID`);
                }

                // Clean up old files
                await cleanupFiles(entity);

                // Upload new file using same ID
                const uploadDir = await ensureUploadDir(id);
                const ext = path.extname(file.originalname);
                const filename = `original${ext}`;
                const filePath = path.join(uploadDir, filename);

                await fs.writeFile(filePath, file.buffer);

                // Generate new thumbnails and blur data
                const thumbnails = await generateThumbnails(filePath, id, file.mimetype);
                const blurDataUrl = await generateBlurDataUrl(filePath, file.mimetype);

                // Update database record
                const updatedEntity = await Model.findByIdAndUpdate(
                    id,
                    {
                        filename,
                        originalName: file.originalname,
                        path: filePath,
                        size: file.size,
                        mimetype: file.mimetype,
                        blurDataUrl,
                    },
                    { new: true }
                );

                const responseData = {
                    ...updatedEntity?.toObject(),
                    thumbnails
                };

                return createSuccessResponse(responseData);
            });
        },

        // Get media with thumbnail URLs
        getWithThumbnails: (id: string, type?: string) => {
            return dbOperation(async () => {
                const result = await baseMethods.getById(id, type);

                if (!result.success) {
                    return result;
                }

                const entity = result.content as IMedia;
                const thumbnails: { [key: string]: string } = {};

                // Generate thumbnail URLs for existing thumbnails
                for (const size of mediaConfig.thumbnailSizes) {
                    const thumbnailPath = path.join(path.dirname(entity.path), `${size.suffix}.webp`);
                    try {
                        await fs.access(thumbnailPath);
                        thumbnails[size.suffix] = `${mediaConfig.baseUrl}/${id}?thumbnail=${size.suffix}`;
                    } catch {
                        // Thumbnail doesn't exist
                    }
                }

                return createSuccessResponse({
                    ...entity,
                    thumbnails
                });
            });
        }
    };

    return {
        ...baseMethods,
        ...mediaMethods,

        // Utility methods
        getConfig: () => mediaConfig,
        clearCache: () => modelCache.clear()
    };
};