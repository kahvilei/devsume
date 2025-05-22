import { createFailResponse, createSuccessResponse, dbOperation, getMongooseParams } from "@/lib/db/utils";
import {Model, Document, UpdateQuery} from "mongoose";
import {DataQuery} from "@/server/models/schemas/data";
import {BaseDataModel} from "@/interfaces/data";

// Cache for dynamically loaded models to avoid repeated imports
const modelCache = new Map<string, object>();

/**
 * Generic model resolver with caching
 */
const createModelResolver = <T extends Document>(
    defaultModel: Model<T>,
    customPath: string
) => {
    return async (type?: string): Promise<Model<T>> => {
        if (!type) return defaultModel;

        const cacheKey = `${customPath}/${type}`;

        if (modelCache.has(cacheKey)) {
            return (modelCache.get(cacheKey) as Model<T>)??defaultModel;
        }

        try {
            const customModel = (await import(`@/custom/${customPath}/${type}/model`)).default;
            modelCache.set(cacheKey, customModel);
            return customModel;
        } catch (e) {
            console.error(`Failed to import custom model for ${type}:`, e);
            // Cache the fallback as well to avoid repeated failed imports
            modelCache.set(cacheKey, defaultModel);
            return defaultModel;
        }
    };
};

/**
 * Generic service factory that creates CRUD operations for any model
 */
export const createServiceFactory = <T extends Document, TInterface = BaseDataModel>(
    defaultModel: Model<T>,
    customPath: string,
    entityName: string
) => {
    const resolveModel = createModelResolver(defaultModel, customPath);
    const entityNameLower = entityName.toLowerCase();

    return {
        // Get all entities
        getAll: (type?: string) => {
            return dbOperation(async () => {
                const Model = await resolveModel(type);
                const entities = await Model.find().lean();
                return createSuccessResponse(entities);
            });
        },

        // Get entities with query parameters
        get: (query: URLSearchParams, type?: string) => {
            return dbOperation(async () => {
                const { sort, filters, limit, skip } = getMongooseParams(query);
                const Model = await resolveModel(type);
                const entities = await Model.find(filters)
                    .sort(sort)
                    .limit(limit)
                    .skip(skip) // Fixed: was missing skip in original code
                    .lean();
                return createSuccessResponse(entities);
            });
        },

        // Get entity by slug
        getBySlug: (slug: string, type?: string) => {
            return dbOperation(async () => {
                const Model = await resolveModel(type);
                const entity = await Model.findOne({ slug }).lean();
                if (!entity) {
                    return createFailResponse(`No ${entityNameLower} found with this slug`);
                }
                return createSuccessResponse(entity);
            });
        },

        // Get entity by ID
        getById: (id: string, type?: string) => {
            return dbOperation(async () => {
                const Model = await resolveModel(type);
                const entity = await Model.findById(id).lean();
                if (!entity) {
                    return createFailResponse(`No ${entityNameLower} found with this ID`);
                }
                return createSuccessResponse(entity);
            });
        },

        // Add new entity
        add: (values: TInterface, type?: string) => {
            return dbOperation(async () => {
                const Model = await resolveModel(type);
                const entity = new Model(values);
                await entity.save();
                return createSuccessResponse(entity);
            });
        },

        // Update entity
        update: (id: string, value: Partial<TInterface>, type?: string) => {
            return dbOperation(async () => {
                const Model = await resolveModel(type);
                const entity = await Model.findByIdAndUpdate(id, value as UpdateQuery<T>, { new: true });
                if (!entity) {
                    return createFailResponse(`No ${entityNameLower} found with this ID`);
                }
                return createSuccessResponse(entity);
            });
        },

        // Delete entity
        delete: (id: string, type?: string) => {
            return dbOperation(async () => {
                const Model = await resolveModel(type);
                const entity = await Model.findByIdAndDelete(id);
                if (!entity) {
                    return createFailResponse(`No ${entityNameLower} found with this ID`);
                }
                return createSuccessResponse(entity);
            });
        },

        // Batch operations
        addMany: (values: TInterface[], type?: string) => {
            return dbOperation(async () => {
                const Model = await resolveModel(type);
                const entities = await Model.insertMany(values);
                return createSuccessResponse(entities);
            });
        },

        // Get count
        getCount: (filters: DataQuery<T> = {}, type?: string) => {
            return dbOperation(async () => {
                const Model = await resolveModel(type);
                const count = await Model.countDocuments(filters);
                return createSuccessResponse({ count });
            });
        },

        // Check if exists
        exists: (filters: DataQuery<T>, type?: string) => {
            return dbOperation(async () => {
                const Model = await resolveModel(type);
                const exists = await Model.exists(filters);
                return createSuccessResponse({ exists: !!exists });
            });
        }
    };
};

// Utility to clear model cache (useful for testing or hot reloading)
export const clearModelCache = () => {
    modelCache.clear();
};