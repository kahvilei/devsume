// Add auto-slug generation
import mongoose from "mongoose";
import slugify from "slugify";

export const withSlugGeneration = (schema: mongoose.Schema, sourceField:string = 'title') => {
    schema.pre('validate', function(next) {
        // Only generate a slug if it doesn't exist or if the source field has changed
        if (!this.slug || this.isModified(sourceField)) {
            // Convert the title (or other source field) to a slug
            this.slug = slugify(this[sourceField] as string, {
                lower: true,          // Convert to lowercase
                strict: false,         // Remove special chars
                replacement: '-',
                trim: true            // Trim leading/trailing spaces
            });
        }
        next();
    });

    return schema;
};