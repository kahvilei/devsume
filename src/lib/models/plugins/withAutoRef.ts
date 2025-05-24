import mongoose from "mongoose";
import {ObjectId, ObjectIdLike} from "bson";

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

    // Pre-save hook: Convert full documents to ObjectId references
    schema.pre('save', async function(next) {
        try {
            const processedObjects = new WeakSet<object>();

            const normalizeDocument = (obj: NormalizableValue, expectedModel: string): mongoose.Types.ObjectId | NormalizableValue => {
                if (!obj) return obj;

                if (mongoose.Types.ObjectId.isValid(obj as string | number | ObjectId | ObjectIdLike | Uint8Array<ArrayBufferLike>) && typeof obj !== 'object') {
                    return obj;
                }
                // If it's a mongoose document or object with _id
                if (obj && typeof obj === 'object' && 'constructor' in obj && '_id' in obj) {
                    const mongooseObj = obj as MongooseDocumentLike;
                    // Verify it's the correct model type (if possible)
                    const modelName = mongooseObj.constructor?.modelName || mongooseObj.$__?.constructor?.modelName;
                    if (!modelName || modelName === expectedModel) {
                        return new mongoose.Types.ObjectId(mongooseObj._id);
                    }
                }

                return obj;
            };

            const normalizeReferences = (obj: NormalizableValue, currentPath: string[] = []): NormalizableValue => {
                if (!obj || (typeof obj === 'object' && processedObjects.has(obj))) {
                    return obj;
                }

                if (typeof obj === 'object') {
                    processedObjects.add(obj);
                }

                // Check if current path matches any configured field
                const fieldPath = currentPath.join('.');
                let matchedConfig = finalConfig[fieldPath];

                // Also check for array element paths (e.g., "categories" matches "categories.0")
                if (!matchedConfig) {
                    const parentPath = currentPath.slice(0, -1).join('.');
                    if (parentPath && finalConfig[parentPath] && /^\d+$/.test(currentPath[currentPath.length - 1])) {
                        matchedConfig = finalConfig[parentPath];
                    }
                }

                if (matchedConfig) {
                    // Handle arrays
                    if (Array.isArray(obj)) {
                        return obj.map((item, index) => {
                            const normalized = normalizeDocument(item, matchedConfig.model);
                            return matchedConfig.deep ?
                                normalizeReferences(normalized, [...currentPath, index.toString()]) :
                                normalized;
                        });
                    } else {
                        // Handle single reference
                        const normalized = normalizeDocument(obj, matchedConfig.model);
                        return matchedConfig.deep ?
                            normalizeReferences(normalized, currentPath) :
                            normalized;
                    }
                }

                // Recursively process nested objects if no direct match
                if (Array.isArray(obj)) {
                    return obj.map((item, index) =>
                        normalizeReferences(item, [...currentPath, index.toString()])
                    );
                } else if (obj && typeof obj === 'object' &&
                    !(obj instanceof Date) &&
                    !(obj instanceof mongoose.Types.ObjectId)) {
                    const result: NormalizableObject = {};
                    const objAsRecord = obj as NormalizableObject;
                    for (const [key, value] of Object.entries(objAsRecord)) {
                        result[key] = normalizeReferences(value, [...currentPath, key]);
                    }
                    return result;
                }

                return obj;
            };

            // Process the entire document
            const docObj = this.toObject() as NormalizableObject;
            const normalized = normalizeReferences(docObj) as NormalizableObject;

            // Apply normalized values back to document
            for (const [key, value] of Object.entries(normalized)) {
                if (key !== '_id' && key !== '__v') {
                    this.set(key, value);
                }
            }

            next();
        } catch (error) {
            next(error as Error);
        }
    });

    // Add autopopulate for configured fields on queries
    for (const [fieldPath, fieldConfig] of Object.entries(finalConfig)) {
        if (fieldConfig.autoPopulate) {
            const populateOptions: PopulateOptions = {
                path: fieldPath,
                model: fieldConfig.model
            };

            if (fieldConfig.populateSelect) {
                populateOptions.select = fieldConfig.populateSelect;
            }

            schema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
                this.populate(populateOptions);
            });
        }
    }

    return schema;
};


// Helper to get inherited config for debugging
export const getModelAutoRefConfig = (modelName: string): AutoReferenceConfig | undefined => {
    return modelConfigs.get(modelName);
};