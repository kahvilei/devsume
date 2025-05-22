// lib/db/media-service-factory.ts
import { createFailResponse, createSuccessResponse, ResponseObject } from "@/lib/db/utils";
import { Model, Document } from "mongoose";
import { IMedia } from "@/server/models/Media";
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp'; // For image processing
import { v4 as uuidv4 } from 'uuid';
import { createModelResolver } from "@/lib/db/model-resolver";
import { dbOperation } from "@/lib/db/db-operation";
import { createServiceFactory, ServiceFactory } from "@/lib/db/service-factory";

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

// Default configuration with absolute path
const defaultConfig: MediaUploadConfig = {
    uploadDir: path.join(process.cwd(), 'uploads'), // Fixed: absolute path
    baseUrl: '/api/media', // Fixed: removed .ts extension
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

interface InternalFile {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
}

// Properly typed metadata
interface MediaMetadata {
    title?: string;
    alt?: string;
    caption?: string;
    description?: string;
    tags?: string[];
}

export interface MediaServiceFactory<TInterface extends IMedia> extends ServiceFactory<TInterface> {
    // Media-specific operations
    uploadFile: (file: InternalFile, metadata?: MediaMetadata, type?: string) => Promise<ResponseObject>;
    uploadFiles: (files: InternalFile[], metadata?: MediaMetadata, type?: string) => Promise<ResponseObject>;
    getFileStream: (id: string, thumbnailType?: string, type?: string) => Promise<ResponseObject>;
    replaceFile: (id: string, file: InternalFile, type?: string) => Promise<ResponseObject>;
    getWithThumbnails: (id: string, type?: string) => Promise<ResponseObject>;
}

/**
 * Enhanced media service factory with file upload capabilities
 */
export const createMediaServiceFactory = <T extends Document & IMedia>( // Fixed: proper type constraint
    defaultModel: Model<T>,
    customPath: string,
    entityName: string,
    config: Partial<MediaUploadConfig> = {}
): MediaServiceFactory<T> => {
    const modelCache = new Map<string, Model<T>>();
    const MAX_CACHE_SIZE = 100; // Prevent memory leak

    const resolveModel = createModelResolver(defaultModel, customPath, modelCache);
    const entityNameLower = entityName.toLowerCase();
    const mediaConfig = { ...defaultConfig, ...config };

    // Cache size management
    const manageCacheSize = () => {
        if (modelCache.size > MAX_CACHE_SIZE) {
            const firstKey = modelCache.keys().next().value;
            if (firstKey) modelCache.delete(firstKey);
        }
    };

    // Utility functions
    const ensureUploadDir = async (mediaId: string) => {
        const uploadPath = path.join(mediaConfig.uploadDir, mediaId);
        await fs.mkdir(uploadPath, { recursive: true });
        return uploadPath;
    };

    const validateFile = (file: { size: number; mimetype: string }) => {
        if (!file.size || !file.mimetype) {
            throw new Error('Invalid file: missing size or mimetype');
        }
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

        try {
            for (const size of mediaConfig.thumbnailSizes) {
                const thumbnailName = `${size.suffix}.webp`;
                const thumbnailPath = path.join(uploadDir, thumbnailName);

                await sharp(filePath)
                    .resize(size.width, size.height, { fit: 'cover' })
                    .webp({ quality: 80 })
                    .toFile(thumbnailPath);

                thumbnails[size.suffix] = `${mediaConfig.baseUrl}/${mediaId}?thumbnail=${size.suffix}`;
            }
        } catch (error) {
            console.error('Error generating thumbnails:', error);
            // Continue without thumbnails rather than failing the upload
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

    // Base CRUD operations
    const baseMethods = createServiceFactory<T, T>(defaultModel, customPath, entityName);

    const mediaMethods: Omit<MediaServiceFactory<T>, keyof ServiceFactory<T>> = {
        // Upload single file
        uploadFile: (
            file: InternalFile,
            metadata: MediaMetadata = {},
            type?: string
        ) => {
            return dbOperation(true, async () => {
                let uploadDir: string | null = null;

                try {
                    validateFile(file);
                    manageCacheSize();

                    const mediaId = uuidv4();
                    uploadDir = await ensureUploadDir(mediaId);

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
                } catch (error) {
                    // Clean up on error
                    if (uploadDir) {
                        await fs.rm(uploadDir, { recursive: true, force: true }).catch(() => {});
                    }
                    throw error;
                }
            });
        },

        // Upload multiple files
        uploadFiles: (
            files: InternalFile[],
            metadata: MediaMetadata = {},
            type?: string
        ) => {
            return dbOperation(true, async () => {
                if (!files || files.length === 0) {
                    return createFailResponse('No files provided', 400);
                }

                const uploadedFiles = [];
                const errors = [];

                for (const file of files) {
                    try {
                        // Call uploadFile directly without dbOperation wrapper since we're already in one
                        validateFile(file);
                        manageCacheSize();

                        const mediaId = uuidv4();
                        const uploadDir = await ensureUploadDir(mediaId);

                        try {
                            const ext = path.extname(file.originalname);
                            const filename = `original${ext}`;
                            const filePath = path.join(uploadDir, filename);

                            await fs.writeFile(filePath, file.buffer);

                            const thumbnails = await generateThumbnails(filePath, mediaId, file.mimetype);
                            const blurDataUrl = await generateBlurDataUrl(filePath, file.mimetype);

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

                            uploadedFiles.push({
                                ...entity.toObject(),
                                thumbnails
                            });
                        } catch (error) {
                            await fs.rm(uploadDir, { recursive: true, force: true }).catch(() => {});
                            throw error;
                        }
                    } catch (error) {
                        errors.push({
                            file: file.originalname,
                            error: error instanceof Error ? error.message : 'Unknown error'
                        });
                    }
                }

                if (uploadedFiles.length === 0) {
                    return createFailResponse('All uploads failed', 400);
                }

                return createSuccessResponse({
                    uploaded: uploadedFiles,
                    errors: errors.length > 0 ? errors : undefined
                });
            });
        },

        // Get file metadata (renamed from getFileStream for clarity)
        getFileStream: (id: string, thumbnailType?: string, type?: string) => {
            return dbOperation(false, async () => {
                const Model = await resolveModel(type);
                const entity = await Model.findById(id) as T;

                if (!entity) {
                    return createFailResponse(`No ${entityNameLower} found with this ID`, 404);
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
            file: InternalFile,
            type?: string
        ) => {
            return dbOperation(true, async () => {
                let uploadDir: string | null = null;

                try {
                    validateFile(file);

                    const Model = await resolveModel(type);
                    const entity = await Model.findById(id) as T;

                    if (!entity) {
                        return createFailResponse(`No ${entityNameLower} found with this ID`, 404);
                    }

                    // Clean up old files
                    await cleanupFiles(entity);

                    // Upload new file using same ID
                    uploadDir = await ensureUploadDir(id);
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
                            updatedAt: new Date()
                        },
                        { new: true }
                    );

                    if (!updatedEntity) {
                        throw new Error('Failed to update entity');
                    }

                    const responseData = {
                        ...updatedEntity.toObject(),
                        thumbnails
                    };

                    return createSuccessResponse(responseData);
                } catch (error) {
                    // Clean up on error
                    if (uploadDir) {
                        await fs.rm(uploadDir, { recursive: true, force: true }).catch(() => {});
                    }
                    throw error;
                }
            });
        },

        // Get media with thumbnail URLs
        getWithThumbnails: (id: string, type?: string) => {
            return dbOperation(false, async () => {
                const Model = await resolveModel(type);
                const entity = await Model.findById(id).lean() as T;

                if (!entity) {
                    return createFailResponse(`No ${entityNameLower} found with this ID`, 404);
                }

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
        clearCache: () => modelCache.clear()
    };
};