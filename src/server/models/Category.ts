// src/models/tag.ts
import mongoose from 'mongoose';
import {withSlugGeneration} from "@/lib/models/withSlugGeneration";
import {Item, ItemBaseSchema} from "@/server/models/schemas/item";

export type ICategory = Item

const CategorySchema = new mongoose.Schema({
    ...ItemBaseSchema
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