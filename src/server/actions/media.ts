import { Media } from "@/server/models";
import { createMediaServiceFactory } from "@/lib/db/media-service-factory";
import { Document } from "mongoose";

const mediaService = createMediaServiceFactory<Document>(
    Media,
    "media",
    "Media",
    {
        uploadDir: 'uploads',
        baseUrl: '/api/media',
        maxFileSize: 50 * 1024 * 1024, // 50MB for media files
        allowedMimeTypes: [
            // Images
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/svg+xml',
            // Videos
            'video/mp4',
            'video/webm',
            'video/quicktime',
            'video/x-msvideo', // .avi
            // Audio
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
            // Documents
            'application/pdf',
            'text/plain',
            // Archives
            'application/zip',
            'application/x-rar-compressed'
        ],
        generateThumbnails: true,
        thumbnailSizes: [
            { width: 150, height: 150, suffix: 'thumb' },
            { width: 300, height: 300, suffix: 'medium' },
            { width: 800, height: 600, suffix: 'large' },
            { width: 1200, height: 800, suffix: 'xl' }
        ],
        generateBlurDataUrl: true // For Next.js Image component
    }
);

// Export service for advanced usage
export { mediaService };