import mongoose from "mongoose";

export interface AutoReferenceConfig {
    [fieldPath: string]: {
        model: string; // Model name to reference
        autoPopulate?: boolean; // Whether to auto-populate on queries (default: false)
        populateSelect?: string; // Fields to select when populating
        deep?: boolean; // Whether to search deeply in nested objects (default: false)
    };
}

interface PopulateOptions {
    path: string;
    model: string;
    select?: string;
}

interface MongooseDocumentLike {
    _id: mongoose.Types.ObjectId | string;
    constructor?: {
        modelName?: string;
    };
    $__?: {
        constructor?: {
            modelName?: string;
        };
    };
}

export type NormalizableValue =
    | string
    | number
    | boolean
    | Date
    | mongoose.Types.ObjectId
    | MongooseDocumentLike
    | NormalizableObject
    | NormalizableArray
    | null
    | undefined;

interface NormalizableObject {
    [key: string]: NormalizableValue;
}

type NormalizableArray = Array<NormalizableValue>

// Store for model configs - allows inheritance
const modelConfigs = new Map<string, AutoReferenceConfig>();

/**
 * Enhanced version that supports config inheritance and merging
 */
export const withAutoReference = (
    schema: mongoose.Schema,
    config: AutoReferenceConfig = {},
    options: {
        inheritFrom?: string; // Model name to inherit config from
        modelName?: string; // Current model name (to store config for future inheritance)
    } = {}
) => {
    // Merge inherited config with current config
    let finalConfig = { ...config };

    if (options.inheritFrom && modelConfigs.has(options.inheritFrom)) {
        const parentConfig = modelConfigs.get(options.inheritFrom)!;
        finalConfig = { ...parentConfig, ...config };
    }

    // Store this config for future inheritance
    if (options.modelName) {
        modelConfigs.set(options.modelName, finalConfig);
    }

    // Add autopopulate for configured fields on queries
    for (const [fieldPath, fieldConfig] of Object.entries(finalConfig)) {
        console.log(fieldPath, fieldConfig);
        if (fieldConfig.autoPopulate) {
            schema.pre(['find', 'findOne'], function(next) {
                this.populate(fieldPath);
                next();
            });
        }
    }

    return schema;
};


// Helper to get inherited config for debugging
export const getModelAutoRefConfig = (modelName: string): AutoReferenceConfig | undefined => {
    return modelConfigs.get(modelName);
};