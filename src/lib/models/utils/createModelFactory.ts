// Helper function to create new post models
import mongoose from "mongoose";
import { AutoReferenceConfig, withAutoReference } from "@/lib/models/plugins/withAutoRef";

interface ModelFactoryOptions {
    autoRefConfig?: AutoReferenceConfig;
    additionalBehaviors?: (schema: mongoose.Schema) => mongoose.Schema;
}

export function createModelFactory<T = mongoose.Document>(
    baseModelName: string,
    baseSchema: mongoose.Schema,
    behaviors: (schema: mongoose.Schema) => mongoose.Schema = (schema) => (schema),
    options: ModelFactoryOptions = {}
) {
    const { autoRefConfig, additionalBehaviors } = options;

    // Apply auto-reference config to base schema if provided
    if (autoRefConfig) {
        withAutoReference(baseSchema, autoRefConfig, {
            modelName: baseModelName
        });
    }

    // Apply provided behaviors
    behaviors(baseSchema);

    // Apply additional behaviors if provided
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
        discriminatorAutoRefConfig: AutoReferenceConfig = {}
    ) => {
        // Return existing model if it already exists
        if (mongoose.models[typeName]) {
            return mongoose.models[typeName];
        }

        // Create new schema with discriminator fields
        const mongooseSchema = new mongoose.Schema(schema);

        // Apply auto-reference with inheritance if base had auto-ref config
        if (autoRefConfig || Object.keys(discriminatorAutoRefConfig).length > 0) {
            withAutoReference(mongooseSchema, discriminatorAutoRefConfig, {
                inheritFrom: baseModelName,
                modelName: typeName
            });
        }

        // Apply custom behaviors
        customBehaviors(mongooseSchema);

        // Apply additional behaviors if provided
        if (additionalBehaviors) {
            additionalBehaviors(mongooseSchema);
        }

        // Create discriminator model
        return BaseModel.discriminator<T>(typeName, mongooseSchema);
    };
}