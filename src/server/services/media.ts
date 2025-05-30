import { Media } from "@/server/models";
import { createMediaServiceFactory } from "@/lib/db/media-service-factory";
import {IMedia} from "@/server/models/Media";

const mediaService = createMediaServiceFactory<IMedia>(
    Media,
    "media",
    "MediaViewer",
    {
        uploadDir: 'public/uploads',
        baseUrl: '/uploads',
        maxFileSize: 50 * 1024 * 1024, // 50MB for files
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

export default mediaService;