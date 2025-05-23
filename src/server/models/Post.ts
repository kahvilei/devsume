import mongoose from 'mongoose';
import { LinkSchema } from "@/server/models/schemas/link";
import {withTimestamps} from "@/lib/models/withTimestamps";
import {withSlugGeneration} from "@/lib/models/withSlugGeneration";
import {Item, ItemBaseSchema} from "@/server/models/schemas/item";

export interface IPost extends Item {
    dates: {
        start: Date;
        end: Date;
    };
    postType: string;
    description: string;
    content: string;
    hasPage: boolean;
    link: string,
    tags?: [],
    links?: [],
    image: string,
    published: boolean;
    publishedAt: Date;
}

// Base Post schema that captures common fields
export const PostSchema = new mongoose.Schema({
    ...ItemBaseSchema,
    dates: {
        start: { type: Date },
        end: { type: Date }
    },
    postType: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String },
    hasPage: { type: Boolean, default: false },
    link: { type: String },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    links: [LinkSchema],
    image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    published: { type: Boolean, default: true },
    publishedAt: { type: Date },
});


// Apply all common schema behaviors in one function
export const applyPostBehaviors = (schema: mongoose.Schema, options: Record<string, string> = { slugSource: 'title'}) => {
    const { slugSource = 'title' } = options;
    withTimestamps(schema);
    withSlugGeneration(schema, slugSource);
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