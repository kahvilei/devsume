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

/**
 * Creates a "discriminator" on the Category model allowing for custom Category types that inherit from the base Category model
 * This should be the default export of a model.ts file under custom/categories/[YOUR_RESUME_TYPE].
 * customBehaviours callback can be applied to add custom schema functions for validation, on delete, etc.
 * @example  export default createCategoryModel('Skill', SkillSchema);
 **/
export const createCategoryModel = createModelFactory('Category', CategorySchema, withSlugGeneration);

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);