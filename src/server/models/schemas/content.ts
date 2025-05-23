import {Item, ItemBaseSchema} from "@/server/models/schemas/item";
import {IMedia} from "@/server/models/Media";
import mongoose from "mongoose";
import {withTimestamps} from "@/lib/models/withTimestamps";
import {withSlugGeneration} from "@/lib/models/withSlugGeneration";
import {withDrafts} from "@/lib/models/withDrafts";
import {withAutoCategories} from "@/lib/models/withAutoCategories";


// Base type for Posts and Resumes
export interface Content extends Item {
    //the "key" image of content. served by default as the preview image and at the top of a content page
    hero?: IMedia
    //served by default as the meta-description and preview description
    description?: string;
    //date set by a behavior plugin on save -- see "/lib/models/withTimestamps"
    published?: boolean;
    //date set by a behavior plugin on initial save -- see "/lib/models/withTimestamps"
    createdAt?: Date;
    //date set by a behavior plugin on save -- see "/lib/models/withTimestamps"
    updatedAt?: Date;
    //set by a behavior plugin on save -- see "withOwner"
    owner?: string;
}

// Base schema for Posts and Resumes
export const ContentBaseSchema = {
    ...ItemBaseSchema,
    hero: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
    description: { type: String },
    published: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    owner: { type: String },
}

//applies functionality needed for Content models including a drafting system, auto-slug generation, timestamps, and auto-categorization
export const applyContentBehaviors = (schema: mongoose.Schema) => {
    withTimestamps(schema);
    withSlugGeneration(schema);
    withDrafts(schema);
    withAutoCategories(schema);
    return schema;
};