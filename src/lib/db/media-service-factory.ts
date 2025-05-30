// lib/db/media-service-factory.ts
import { createFailResponse, createSuccessResponse, ResponseObject } from "@/lib/db/utils";
import {Model, Document} from "mongoose";
import { IMedia } from "@/server/models/Media";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { createModelResolver } from "@/lib/db/model-resolver";
import { dbOperation } from "@/lib/db/db-operation";
import { createServiceFactory, ServiceFactory } from "@/lib/db/service-factory";

// File upload configuration
export interface MediaUploadConfig {
    uploadDir: string;
    baseUrl: string;
    maxFileSize: number;
    allowedMimeTypes: string[];
    generateThumbnails: boolean;
    thumbnailSizes: { width: number; height: number; suffix: string }[];
    generateBlurDataUrl: boolean;
}

const defaultConfig: MediaUploadConfig = {
    uploadDir: path.join(process.cwd(), "uploads"),
    baseUrl: "/api/media",
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "application/pdf"],
    generateThumbnails: true,
    thumbnailSizes: [
        { width: 150, height: 150, suffix: "thumb" },
        { width: 300, height: 300, suffix: "medium" },
        { width: 800, height: 600, suffix: "large" },
    ],
    generateBlurDataUrl: true,
};

interface InternalFile {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
}

interface MediaMetadata {
    title?: string;
    alt?: string;
    caption?: string;
    description?: string;
    tags?: string[];
}

export interface MediaServiceFactory<TInterface extends IMedia> extends ServiceFactory<TInterface> {
    // MediaViewer-specific operations
    uploadFile: (file: InternalFile, metadata?: MediaMetadata, type?: string) => Promise<ResponseObject>;
    uploadFiles: (files: InternalFile[], metadata?: MediaMetadata, type?: string) => Promise<ResponseObject>;
    getFileStream: (id: string, thumbnailType?: string, type?: string) => Promise<ResponseObject>;
    replaceFile: (id: string, file: InternalFile, metadata?: MediaMetadata, type?: string) => Promise<ResponseObject>;
    deleteAndClean: (id: string, type: string) => Promise<ResponseObject>;
}

export const createMediaServiceFactory = <T extends IMedia>(
    defaultModel: Model<Document<T>>,
    customPath: string,
    entityName: string,
    config: Partial<MediaUploadConfig> = {}
): MediaServiceFactory<T> => {
    const modelCache = new Map<string, Model<Document<T>>>();
    const MAX_CACHE_SIZE = 100; // Prevent memory leaks

    const resolveModel = createModelResolver(defaultModel, customPath, modelCache);
    const entityNameLower = entityName.toLowerCase();
    const mediaConfig = { ...defaultConfig, ...config };

    const generateEntity = async (file: InternalFile, metadata: MediaMetadata = {}): Promise<Partial<IMedia>> => {
        const slug = buildSlug(metadata.title || path.basename(file.originalname, path.extname(file.originalname)));
        const uploadDir = await ensureUploadDir(slug);

        try {
            const filename = `original${path.extname(file.originalname)}`;
            const filePath = path.join(uploadDir, filename);

            await fs.writeFile(filePath, file.buffer);
            const thumbnails = await generateThumbnails(filePath, slug, file.mimetype);
            const blurDataUrl = await generateBlurDataUrl(filePath, file.mimetype);
            return {
                ...metadata,
                filename,
                originalName: file.originalname,
                path: filePath,
                url: `${mediaConfig.baseUrl}/${slug}/${filename}`,
                slug,
                size: file.size,
                mimetype: file.mimetype,
                blurDataUrl,
                createdAt: new Date(),
                thumbnails
            };
        } catch (error) {
            await fs.rm(uploadDir, { recursive: true, force: true }).catch(() => {});
            throw error;
        }

    }

    // MediaViewer methods
    const uploadFile = async (file: InternalFile, metadata: MediaMetadata = {}, type?: string): Promise<ResponseObject> => {
        return dbOperation(true, async () => {
            validateFile(file);
            manageCacheSize();

            try {
                const mediaData = await generateEntity(file, metadata);
                const Model = await resolveModel(type);
                const entity = new Model(mediaData);
                await entity.save();
                return createSuccessResponse({ ...entity.toObject()});
            } catch (error) {
                throw error;
            }
        });
    };

    const replaceFile = async (id: string, file: InternalFile, metadata: MediaMetadata = {}, type?: string): Promise<ResponseObject> => {
        return dbOperation(true, async () => {
            validateFile(file);
            manageCacheSize();

            const Model = await resolveModel(type);
            const entity = await Model.findById(id) as T;
            if (!entity) return createFailResponse(`No ${entityNameLower} found with this ID`, 404);
            await cleanupFiles(entity);

            try {
                const mediaData = await generateEntity(file, metadata);
                const updatedEntity = await Model.findByIdAndUpdate(
                    id,
                    mediaData,
                    { new: true }
                );
                if (!updatedEntity) throw new Error("Failed to upload entity");
                return createSuccessResponse({ ...updatedEntity.toObject()});
            } catch (error) {
                throw error;
            }
        });
    };


    const uploadFiles = async (files: InternalFile[], metadata: MediaMetadata = {}, type?: string): Promise<ResponseObject> => {
        const results = await Promise.all(files.map(file => uploadFile(file, metadata, type)));
        return createSuccessResponse(results);
    };

    const getFileStream = async (id: string, thumbnailType?: string, type?: string): Promise<ResponseObject> => {
        return dbOperation(false, async () => {
            const Model = await resolveModel(type);
            const entity = await Model.findById(id) as T;

            if (!entity) return createFailResponse(`No ${entityNameLower} found with this ID`, 404);

            let filePath = entity.path;
            let mimetype = entity.mimetype;

            if (thumbnailType) {
                const thumbnailPath = path.join(path.dirname(entity.path), `${thumbnailType}.webp`);
                try {
                    await fs.access(thumbnailPath);
                    filePath = thumbnailPath;
                    mimetype = "image/webp";
                } catch {
                    // Fallback to original file
                }
            }

            return createSuccessResponse({ filePath, mimetype, filename: entity.filename, originalName: entity.originalName, size: entity.size });
        });
    };

    const deleteAndClean = async (id: string, type?: string): Promise<ResponseObject> => {
        return dbOperation(true, async () => {
            const Model = await resolveModel(type);
            const entity = await Model.findById(id).lean() as T;

            if (!entity) return createFailResponse(`No ${entityNameLower} found with this ID`, 404);

            await cleanupFiles(entity);
            const result = await Model.findByIdAndDelete(id);
            return result ? createSuccessResponse(result) : createFailResponse(`Failed to delete ${entityNameLower}`);
        });
    };

    // Cache management
    const manageCacheSize = () => {
        if (modelCache.size > MAX_CACHE_SIZE) {
            const [firstKey] = modelCache.keys();
            modelCache.delete(firstKey);
        }
    };

    // Utilities
    const ensureUploadDir = async (mediaId: string): Promise<string> => {
        const uploadPath = path.join(mediaConfig.uploadDir, mediaId);
        await fs.mkdir(uploadPath, { recursive: true });
        return uploadPath;
    };

    const validateFile = ({ size, mimetype }: InternalFile) => {
        if (!size || !mimetype) throw new Error("Invalid file: missing size or mimetype");
        if (size > mediaConfig.maxFileSize) throw new Error(`File size exceeds max allowed size of ${mediaConfig.maxFileSize} bytes`);
        if (!mediaConfig.allowedMimeTypes.includes(mimetype)) throw new Error(`File type ${mimetype} is not allowed`);
    };

    const generateThumbnails = async (filePath: string, mediaId: string, mimetype: string): Promise<Record<string, string>> => {
        if (!mediaConfig.generateThumbnails || !mimetype.startsWith("image/")) return {};
        const thumbnails: Record<string, string> = {};
        const uploadDir = path.join(mediaConfig.uploadDir, mediaId);

        for (const { width, height, suffix } of mediaConfig.thumbnailSizes) {
            const thumbnailName = `${suffix}.webp`;
            const thumbnailPath = path.join(uploadDir, thumbnailName);

            try {
                await sharp(filePath).resize(width, height, { fit: "cover" }).webp({ quality: 80 }).toFile(thumbnailPath);
                thumbnails[suffix] = `${mediaConfig.baseUrl}/${mediaId}?thumbnail=${suffix}`;
            } catch (error) {
                console.error(`Error generating thumbnail (${suffix}):`, error);
            }
        }
        return thumbnails;
    };

    const generateBlurDataUrl = async (filePath: string, mimetype: string): Promise<string> => {
        if (!mediaConfig.generateBlurDataUrl || !mimetype.startsWith("image/")) return "";
        try {
            const buffer = await sharp(filePath).resize(10, 10, { fit: "cover" }).blur(1).jpeg({ quality: 20 }).toBuffer();
            return `data:image/jpeg;base64,${buffer.toString("base64")}`;
        } catch (error) {
            console.error("Error generating blur data URL:", error);
            return "";
        }
    };

    const cleanupFiles = async (mediaEntity: IMedia) => {
        try {
            const uploadDir = path.dirname(mediaEntity.path);
            await fs.rm(uploadDir, { recursive: true, force: true });
        } catch (error) {
            console.error("Error cleaning up files:", error);
        }
    };

    const buildSlug = (base: string) =>
        base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    // Return combined methods
    return {
        ...createServiceFactory<T>(defaultModel, customPath, entityName),
        uploadFile,
        uploadFiles,
        getFileStream,
        replaceFile,
        deleteAndClean,
        clearCache: () => modelCache.clear(),
    };
};