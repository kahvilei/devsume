// src/lib/models/utils/createModelFactory.ts
import mongoose from "mongoose";

export const createModelFactory = <T = mongoose.Document>(
    baseModelName: string,
    baseSchema: mongoose.Schema,
    additionalBehaviors?: (schema: mongoose.Schema) => mongoose.Schema
) => {

    // Apply additional behaviors to base schema
    if (additionalBehaviors) {
        additionalBehaviors(baseSchema);
    }

    // Create base model if it doesn't exist
    const BaseModel = mongoose.models[baseModelName] || mongoose.model<T>(baseModelName, baseSchema);

    // Return factory function for creating discriminators
    return (
        typeName: string,
        schema: mongoose.SchemaDefinition | object,
        customBehaviors: (schema: mongoose.Schema) => mongoose.Schema = (schema) => (schema),
    ) => {
        // Return existing model if it already exists
        if (mongoose.models[typeName]) {
            return mongoose.models[typeName];
        }

        // Create new schema with discriminator fields
        const mongooseSchema = new mongoose.Schema(schema);

        // Apply custom behaviors
        customBehaviors(mongooseSchema);

        // Create discriminator model
        return BaseModel.discriminator<T>(typeName, mongooseSchema);
    };
};