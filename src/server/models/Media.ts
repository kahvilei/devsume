import mongoose from 'mongoose';
import {IBaseItem, ItemBaseSchema} from "@/server/models/schemas/IBaseItem";
import {createModelFactory} from "@/lib/models/utils/createModelFactory";

export interface IMedia extends IBaseItem{
    filename: string;
    originalName: string;
    path: string;
    url: string;
    size: number;
    mimetype: string;
    alt: string;
    caption: string;
    blurDataUrl: string;
    createdAt: Date;
    metadata: {
        description: string;
        tags: string[];
    };
    file?: File;
    thumbnails?: {
        [key: string]: string;
    };
}
export const MediaSchemaDefinition = {
    ...ItemBaseSchema,
    filename: { type: String, required: true },
    title: { type: String },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
    alt: { type: String, default: '' },
    caption: { type: String },
    blurDataUrl: { type: String }, // For next/image optimization
    createdAt: { type: Date, default: Date.now },
    metadata: {
        description: { type: String },
        tags: [{ type: String }]
    },
    thumbnails: {
        type: Object,
    }
};

const MediaSchema = new mongoose.Schema(MediaSchemaDefinition);

export const createMediaModel = createModelFactory(
    'Media',
    MediaSchema,
   );

export default mongoose.models.Media || mongoose.model('Media', MediaSchema);