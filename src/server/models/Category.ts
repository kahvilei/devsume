// src/models/tag.ts
import mongoose from 'mongoose';
import {BaseDataModel} from "@/interfaces/data";
import {withSlugGeneration} from "@/lib/models/withSlugGeneration";

export interface ICategory extends BaseDataModel {
    _id?: string;
    title: string;
    slug?: string;
    tags?: string[]
}

const CategorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    tags: [{ type: String }]
});

// Apply timestamps and auto-slug generation
withSlugGeneration(CategorySchema);

// Helper function to create new post models
export function createCategoryModel(typeName: string, schema: object) {
    // Return if model already exists
    if (mongoose.models[typeName]) {
        return mongoose.models[typeName];
    }

    // If Category model doesn't exist yet, create it first
    if (!mongoose.models.Category) {
        mongoose.model('Category', withSlugGeneration(CategorySchema));
    }

    // Create a discriminator model for this post type
    return mongoose.models.Category.discriminator(
        typeName,
        new mongoose.Schema(schema)
    );
}

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);