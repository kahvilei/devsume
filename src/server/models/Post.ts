import mongoose from 'mongoose';
import { LinkSchema } from "@/server/models/schemas/link";
import {withTimestamps} from "@/lib/models/withTimestamps";
import {withSlugGeneration} from "@/lib/models/withSlugGeneration";
import {Item, ItemBaseSchema} from "@/server/models/schemas/item";
import {withDrafts} from "@/lib/models/withDrafts";

export interface IPost extends Item {
    description: string;
    content: string;
    link: string,
    useExternal: boolean, //if true, page is external, and we will not use content
    links?: [],
    hero: string,
    published: boolean;
    publishedAt: Date;
}

// Base Post schema that captures common fields
export const PostSchema = new mongoose.Schema({
    ...ItemBaseSchema,
    description: { type: String, required: true },
    content: { type: String, required: true },
    link: { type: String, required: false },
    useExternal: { type: Boolean, default: false },
    links: [LinkSchema],
    hero: { type: String, required: true },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date, default: Date.now }
});


// Apply all common schema behaviors in one function
export const applyPostBehaviors = (schema: mongoose.Schema, options: Record<string, string> = { slugSource: 'title'}) => {
    const { slugSource = 'title' } = options;
    withTimestamps(schema);
    withSlugGeneration(schema, slugSource);
    withDrafts(schema);
    return schema;
};

applyPostBehaviors(PostSchema);

// Helper function to create new post models
export function createPostModel(typeName: string, schema: object) {
    // Return if model already exists
    if (mongoose.models[typeName]) {
        return mongoose.models[typeName];
    }

    // If Post model doesn't exist yet, create it first
    if (!mongoose.models.Post) {
        mongoose.model('Post', applyPostBehaviors(PostSchema));
    }

    // Create a discriminator model for this post type
    return mongoose.models.Post.discriminator(
        typeName,
        new mongoose.Schema(schema)
    );
}

export default mongoose.models.Post || mongoose.model('Post', PostSchema);