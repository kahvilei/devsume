import mongoose from 'mongoose';
import { LinkSchema } from "@/models/link";
import slugify from 'slugify';

// Base Post schema that captures common fields
export const PostSchema = {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    about: { type: String },
    hasPage: { type: Boolean, default: false },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    links: [LinkSchema],
    image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }
};

// Add timestamps to schema
export const withTimestamps = (schema: mongoose.Schema) => {
    schema.add({
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    });

    schema.pre('save', function(next) {
        this.updatedAt = new Date();
        next();
    });

    return schema;
};

// Add page-link validation
export const withPageLinkValidation = (schema: mongoose.Schema) => {
    schema.pre('validate', function(next) {
        if (this.hasPage && this.link) {
            this.invalidate('link', 'Link cannot be set if hasPage is true');
        }
        next();
    });

    return schema;
};

// Add auto-slug generation
export const withSlugGeneration = (schema: mongoose.Schema, sourceField:string = 'title') => {
    schema.pre('validate', function(next) {
        // Only generate slug if it doesn't exist or if the source field has changed
        if (!this.slug || this.isModified(sourceField)) {
            // Convert the title (or other source field) to a slug
            const baseSlug = slugify(this[sourceField] as string, {
                lower: true,          // Convert to lowercase
                strict: true,         // Remove special chars
                trim: true            // Trim leading/trailing spaces
            });

            // Add a short random string to ensure uniqueness if this is a new document
            if (!this.slug && this.isNew) {
                const randomString = Math.random().toString(36).substring(2, 6);
                this.slug = `${baseSlug}-${randomString}`;
            } else if (!this.isNew) {
                // For existing documents, just update with the new slugified title
                this.slug = baseSlug;
            }
        }
        next();
    });

    return schema;
};

// Apply all common schema behaviors in one function
export const applyPostBehaviors = (schema: mongoose.Schema, options: Record<string, string> = { slugSource: 'title'}) => {
    const { slugSource = 'title' } = options;

    withTimestamps(schema);
    withPageLinkValidation(schema);
    withSlugGeneration(schema, slugSource);

    return schema;
};