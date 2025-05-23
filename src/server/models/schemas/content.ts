import {Item, ItemBaseSchema} from "@/server/models/schemas/item";
import {IMedia} from "@/server/models/Media";
import {ICategory} from "@/server/models/Category";
import mongoose from "mongoose";
import {withTimestamps} from "@/lib/models/withTimestamps";
import {withSlugGeneration} from "@/lib/models/withSlugGeneration";
import {withDrafts} from "@/lib/models/withDrafts";
import {withAutoCategories} from "@/lib/models/withAutoCategories";

export interface Content extends Item {
    hero?: IMedia
    description?: string;
    published?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    owner?: string;
    categories?: ICategory[];
}

export const ContentBaseSchema = {
    ...ItemBaseSchema,
    hero: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
    description: { type: String },
    published: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    owner: { type: String },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
}

export const applyContentBehaviors = (schema: mongoose.Schema) => {
    withTimestamps(schema);
    withSlugGeneration(schema);
    withDrafts(schema);
    withAutoCategories(schema);
    return schema;
};