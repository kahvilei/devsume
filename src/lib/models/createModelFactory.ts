// Helper function to create new post models
import mongoose from "mongoose";

export function createModelFactory(baseModelName: string, baseSchema: mongoose.Schema, behaviors: (schema: mongoose.Schema) => mongoose.Schema = (schema) => (schema)) {
    // Return if model already exists
    return (typeName: string, schema: object, customBehaviors: (schema: mongoose.Schema) => mongoose.Schema = (schema) => (schema)) => {
        if (mongoose.models[typeName]) {
            return mongoose.models[typeName];
        }

        // If Post model doesn't exist yet, create it first
        if (!mongoose.models[baseModelName]) {
            mongoose.model(baseModelName, behaviors(baseSchema));
        }

        const mongooseSchema = new mongoose.Schema(schema);

        customBehaviors(mongooseSchema);

        // Create a discriminator model for this post type
        return mongoose.models.Post.discriminator(
            typeName,
            mongooseSchema
        );
    }
}