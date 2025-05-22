import {
    createFailResponse,
    createSuccessResponse,
    getMongooseParams,
    ResponseObject
} from "@/lib/db/utils";
import { Model, Document, UpdateQuery } from "mongoose";
import { DataQuery } from "@/server/models/schemas/data";
import { BaseDataModel } from "@/interfaces/data";
import { createModelResolver } from "@/lib/db/model-resolver";
import { dbOperation } from "@/lib/db/db-operation";

export interface ServiceFactory<TInterface extends BaseDataModel> {
    getAll: (type?: string) => Promise<ResponseObject>;
    get: (query: URLSearchParams, type?: string) => Promise<ResponseObject>;
    getBySlug: (slug: string, type?: string) => Promise<ResponseObject>;
    getById: (id: string, type?: string) => Promise<ResponseObject>;
    add: (values: TInterface, type?: string) => Promise<ResponseObject>;
    update: (id: string, value: Partial<TInterface>, type?: string) => Promise<ResponseObject>;
    delete: (id: string, type?: string) => Promise<ResponseObject>;
    addMany: (values: TInterface[], type?: string) => Promise<ResponseObject>;
    getCount: (filters?: DataQuery<TInterface>, type?: string) => Promise<ResponseObject>;
    exists: (filters: DataQuery<TInterface>, type?: string) => Promise<ResponseObject>;
    clearCache: () => void;
}

export const createServiceFactory = <T extends Document & BaseDataModel, TInterface extends BaseDataModel>(
    defaultModel: Model<T>,
    customPath: string,
    entityName: string
): ServiceFactory<TInterface> => {
    const modelCache = new Map<string, Model<T>>();
    const MAX_CACHE_SIZE = 100; // Prevent memory leak

    const resolveModel = createModelResolver(defaultModel, customPath, modelCache);
    const entityNameLower = entityName.toLowerCase();

    // Cache size management
    const manageCacheSize = () => {
        if (modelCache.size > MAX_CACHE_SIZE) {
            const firstKey = modelCache.keys().next().value;
            if (firstKey) modelCache.delete(firstKey);
        }
    };

    // Validation helpers
    const validateId = (id: string): boolean => {
        return /^[0-9a-fA-F]{24}$/.test(id) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id);
    };

    return {
        // Get all entities
        getAll: (type?: string) => {
            return dbOperation(false, async () => {
                manageCacheSize();
                const Model = await resolveModel(type);
                const entities = await Model.find().lean();
                return createSuccessResponse(entities);
            });
        },

        // Get entities with query parameters
        get: (query: URLSearchParams, type?: string) => {
            return dbOperation(false, async () => {
                manageCacheSize();
                const { sort, filters, limit, skip } = getMongooseParams(query);
                const Model = await resolveModel(type);

                // Build query with proper typing
                let mongoQuery = Model.find(filters);

                if (sort && Object.keys(sort).length > 0) {
                    mongoQuery = mongoQuery.sort(sort);
                }

                if (limit > 0) {
                    mongoQuery = mongoQuery.limit(limit);
                }

                if (skip > 0) {
                    mongoQuery = mongoQuery.skip(skip); // Fixed: was missing in original
                }

                const entities = await mongoQuery.lean();

                // Include total count for pagination
                const total = await Model.countDocuments(filters);

                return createSuccessResponse({
                    data: entities,
                    pagination: {
                        total,
                        limit,
                        skip,
                        hasMore: skip + entities.length < total
                    }
                });
            });
        },

        // Get entity by slug
        getBySlug: (slug: string, type?: string) => {
            return dbOperation(false, async () => {
                if (!slug || typeof slug !== 'string') {
                    return createFailResponse('Invalid slug provided');
                }

                manageCacheSize();
                const Model = await resolveModel(type);
                const entity = await Model.findOne({ slug }).lean();

                if (!entity) {
                    return createFailResponse(`No ${entityNameLower} found with slug: ${slug}`);
                }

                return createSuccessResponse(entity);
            });
        },

        // Get entity by ID
        getById: (id: string, type?: string) => {
            return dbOperation(false, async () => {
                if (!validateId(id)) {
                    return createFailResponse('Invalid ID format');
                }

                manageCacheSize();
                const Model = await resolveModel(type);
                const entity = await Model.findById(id).lean();

                if (!entity) {
                    return createFailResponse(`No ${entityNameLower} found with ID: ${id}`);
                }

                return createSuccessResponse(entity);
            });
        },

        // Add new entity
        add: (values: TInterface, type?: string) => {
            return dbOperation(true, async () => {
                if (!values || typeof values !== 'object') {
                    return createFailResponse('Invalid data provided');
                }

                manageCacheSize();
                const Model = await resolveModel(type);
                const entity = new Model(values);

                try {
                    await entity.save();
                    return createSuccessResponse(entity.toObject());
                } catch (error) {
                    if (error instanceof Error) {
                        // Handle duplicate key errors
                        if (error.message.includes('duplicate key')) {
                            return createFailResponse('A record with this unique field already exists');
                        }
                        // Handle validation errors
                        if (error.name === 'ValidationError') {
                            return createFailResponse(`Validation error: ${error.message}`);
                        }
                    }
                    throw error;
                }
            });
        },

        // Update entity
        update: (id: string, value: Partial<TInterface>, type?: string) => {
            return dbOperation(true, async () => {
                if (!validateId(id)) {
                    return createFailResponse('Invalid ID format');
                }

                if (!value || typeof value !== 'object') {
                    return createFailResponse('Invalid update data provided');
                }

                manageCacheSize();
                const Model = await resolveModel(type);

                // Remove undefined values
                const cleanedValue = Object.entries(value).reduce((acc, [key, val]) => {
                    if (val !== undefined) {
                        acc[key] = val;
                    }
                    return acc;
                }, {} as Record<string, any>);

                const entity = await Model.findByIdAndUpdate(
                    id,
                    cleanedValue as UpdateQuery<T>,
                    {
                        new: true,
                        runValidators: true
                    }
                );

                if (!entity) {
                    return createFailResponse(`No ${entityNameLower} found with ID: ${id}`);
                }

                return createSuccessResponse(entity.toObject());
            });
        },

        // Delete entity
        delete: (id: string, type?: string) => {
            return dbOperation(true, async () => {
                if (!validateId(id)) {
                    return createFailResponse('Invalid ID format');
                }

                manageCacheSize();
                const Model = await resolveModel(type);
                const entity = await Model.findByIdAndDelete(id);

                if (!entity) {
                    return createFailResponse(`No ${entityNameLower} found with ID: ${id}`);
                }

                return createSuccessResponse({
                    deleted: true,
                    entity: entity.toObject()
                });
            });
        },

        // Batch operations
        addMany: (values: TInterface[], type?: string) => {
            return dbOperation(true, async () => {
                if (!Array.isArray(values) || values.length === 0) {
                    return createFailResponse('Invalid array of data provided');
                }

                manageCacheSize();
                const Model = await resolveModel(type);

                try {
                    const entities = await Model.insertMany(values, {
                        ordered: false // Continue on error
                    });

                    return createSuccessResponse({
                        inserted: entities.length,
                        entities: entities.map(e => e.toObject())
                    });
                } catch (error) {
                    if (error instanceof Error && 'writeErrors' in error) {
                        const bulkError = error as any;
                        return createSuccessResponse({
                            inserted: bulkError.insertedDocs?.length || 0,
                            errors: bulkError.writeErrors,
                            entities: bulkError.insertedDocs || []
                        });
                    }
                    throw error;
                }
            });
        },

        // Get count
        getCount: (filters: DataQuery<TInterface> = {}, type?: string) => {
            return dbOperation(false, async () => { // Changed to false - read operation
                manageCacheSize();
                const Model = await resolveModel(type);
                const count = await Model.countDocuments(filters as any);
                return createSuccessResponse({ count });
            });
        },

        // Check if exists
        exists: (filters: DataQuery<TInterface>, type?: string) => {
            return dbOperation(false, async () => { // Changed to false - read operation
                if (!filters || typeof filters !== 'object') {
                    return createFailResponse('Invalid filters provided');
                }

                manageCacheSize();
                const Model = await resolveModel(type);
                const exists = await Model.exists(filters as any);
                return createSuccessResponse({ exists: !!exists });
            });
        },

        clearCache: () => {
            modelCache.clear();
        }
    };
};