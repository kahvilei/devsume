// src/models/tag.ts
import mongoose from 'mongoose';
import {withSlugGeneration} from "@/lib/models/withSlugGeneration";
import {Item, ItemBaseSchema} from "@/server/models/schemas/item";
import {createModelFactory} from "@/lib/models/createModelFactory";

export type ICategory = Item

const CategorySchema = new mongoose.Schema({
    ...ItemBaseSchema
});

// Apply timestamps and auto-slug generation
withSlugGeneration(CategorySchema);

export const createCategoryModel = createModelFactory('Category', CategorySchema, withSlugGeneration);

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);