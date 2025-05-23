import mongoose from 'mongoose';
import {Item, ItemBaseSchema} from "@/server/models/schemas/item";

export interface IMedia extends Item{
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
    formData?: FormData; //only exists front-side for upload
}
export const MediaSchema = new mongoose.Schema({
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
    }
});

// Helper function to create new post models
export function createMediaModel(typeName: string, schema: object) {
    // Return if model already exists
    if (mongoose.models[typeName]) {
        return mongoose.models[typeName];
    }

    // If Category model doesn't exist yet, create it first
    if (!mongoose.models.Media) {
        mongoose.model('Media', MediaSchema);
    }

    // Create a discriminator model for this post type
    return mongoose.models.Media.discriminator(
        typeName,
        new mongoose.Schema(schema)
    );
}

export default mongoose.models.Media || mongoose.model('Media', MediaSchema);