import mongoose from 'mongoose';

// Creating a schema definition that can be reused
export const LinkSchemaDefinition = {
    title: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String }, // Optional icon name/class
    isExternal: { type: Boolean, default: true }, // Whether link points outside the site
    order: { type: Number, default: 0 } // For ordering links
};

// Create the actual schema for use in other models
export const LinkSchema = new mongoose.Schema(LinkSchemaDefinition);

// Export a type interface for TypeScript
export interface ILink {
    title: string;
    url: string;
    icon?: string;
    isExternal?: boolean;
    order?: number;
}