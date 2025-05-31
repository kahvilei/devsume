import {
    createFailResponse,
    createSuccessResponse,
    getMongooseParams,
    ResponseObject,
    PagContent
} from "@/lib/db/utils";
import { Model, UpdateQuery, Document } from "mongoose";
import { createModelResolver } from "@/lib/db/model-resolver";
import { dbOperation } from "@/lib/db/db-operation";

export interface ServiceFactory<TInterface> {
    getAll: (type?: string) => Promise<ResponseObject>;
    get: (query: URLSearchParams, type?: string) => Promise<ResponseObject>;
    getBySlug: (slug: string, type?: string) => Promise<ResponseObject>;
    getById: (id: string, type?: string) => Promise<ResponseObject>;
    add: (values: TInterface, type?: string) => Promise<ResponseObject>;
    update: (id: string, value: Partial<TInterface>, type?: string) => Promise<ResponseObject>;
    delete: (id: string, type?: string) => Promise<ResponseObject>;
    addMany: (values: TInterface[], type?: string) => Promise<ResponseObject>;
    getCount: (query: URLSearchParams, type?: string) => Promise<ResponseObject>;
    exists: (query: URLSearchParams, type?: string) => Promise<ResponseObject>;
    getTotalCount: (type?: string) => Promise<ResponseObject>;
    clearCache: () => void;
}


export const createServiceFactory = <T>(
    defaultModel: Model<Document<T>>,
    customPath: string,
    entityName: string
): ServiceFactory<T> => {
    const modelCache = new Map<string, Model<Document<T>>>();
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

    // Helper to calculate pagination metadata
    const calculatePagination = (total: number, limit: number, skip: number): PagContent => {
        const pages = Math.ceil(total / limit) || 1;
        const page = Math.floor(skip / limit) + 1;

        return {
            total,
            limit,
            skip,
            page,
            pages,
            hasMore: skip + limit < total
        };
    };

    return {
        // Get all entities with pagination info
        getAll: (type?: string) => {
            return dbOperation(false, async () => {
                manageCacheSize();
                const Model = await resolveModel(type);

                // Get both entities and total count
                const [entities, total] = await Promise.all([
                    Model.find().lean(),
                    Model.countDocuments()
                ]);

                const pagination = calculatePagination(total, entities.length, 0);

                return createSuccessResponse(entities, pagination);
            });
        },

        // Get entities with query parameters and full pagination
        get: (query: URLSearchParams, type?: string) => {
            return dbOperation(false, async () => {
                manageCacheSize();
                const { sort, filters, limit, skip } = getMongooseParams(query);
                const Model = await resolveModel(type);

                // Execute query and count in parallel for better performance
                const [entities, total] = await Promise.all([
                    Model.find(filters)
                        .sort(sort && Object.keys(sort).length > 0 ? sort : {})
                        .limit(limit)
                        .skip(skip)
                        .lean().populate(''),
                    Model.countDocuments(filters)
                ]);

                const pagination = calculatePagination(total, limit, skip);

                return createSuccessResponse(entities, pagination);
            });
        },

        // Get entity by slug (no pagination needed)
        getBySlug: (slug: string, type?: string) => {
            return dbOperation(false, async () => {
                if (!slug) {
                    return createFailResponse('Invalid slug provided', 400);
                }

                manageCacheSize();
                const Model = await resolveModel(type);
                const entity = await Model.findOne({ slug }).lean().populate('');

                if (!entity) {
                    return createFailResponse(`No ${entityNameLower} found with slug: ${slug}`, 404);
                }

                return createSuccessResponse(entity);
            });
        },

        // Get entity by ID (no pagination needed)
        getById: (id: string, type?: string) => {
            return dbOperation(false, async () => {
                if (!validateId(id)) {
                    return createFailResponse('Invalid ID format', 400);
                }

                manageCacheSize();
                const Model = await resolveModel(type);
                const entity = await Model.findById(id).lean().populate('');

                if (!entity) {
                    return createFailResponse(`No ${entityNameLower} found with ID: ${id}`, 404);
                }

                return createSuccessResponse(entity);
            });
        },

        // Add new entity (return updated total count)
        add: (values: T, type?: string) => {
            return dbOperation(true, async () => {
                if (!values || typeof values !== 'object') {
                    return createFailResponse('Invalid data provided', 400);
                }

                manageCacheSize();
                const Model = await resolveModel(type);
                const entity = new Model(values);

                try {
                    await entity.save();

                    // Get updated total count
                    const total = await Model.countDocuments();

                    return createSuccessResponse(
                        entity.toObject(),
                        { total }
                    );
                } catch (error) {
                    if (error instanceof Error) {
                        // Handle duplicate key errors
                        if (error.message.includes('duplicate key')) {
                            return createFailResponse('A record with this unique field already exists', 409);
                        }
                        // Handle validation errors
                        if (error.name === 'ValidationError') {
                            return createFailResponse(`Validation error: ${error.message}`, 400);
                        }
                    }
                    throw error;
                }
            });
        },

        // Update entity
        update: (id: string, value: Partial<T>, type?: string) => {
            return dbOperation(true, async () => {
                if (!validateId(id)) {
                    return createFailResponse('Invalid ID format', 400);
                }

                if (!value || typeof value !== 'object') {
                    return createFailResponse('Invalid upload data provided', 400);
                }

                manageCacheSize();
                const Model = await resolveModel(type);

                // Remove undefined values
                const cleanedValue = Object.entries(value).reduce((acc, [key, val]) => {
                    if (val !== undefined && val !== null) {
                        acc[key] = val;
                    }
                    return acc;
                }, {} as Record<string, object>);

                const entity = await Model.findByIdAndUpdate(
                    id,
                    cleanedValue as UpdateQuery<T>,
                    {
                        new: true,
                        runValidators: true
                    }
                ).populate('');

                if (!entity) {
                    return createFailResponse(`No ${entityNameLower} found with ID: ${id}`, 404);
                }

                return createSuccessResponse(entity.toObject());
            });
        },

        // Delete entity (return updated total count)
        delete: (id: string, type?: string) => {
            return dbOperation(true, async () => {
                if (!validateId(id)) {
                    return createFailResponse('Invalid ID format', 400);
                }

                manageCacheSize();
                const Model = await resolveModel(type);
                const entity = await Model.findByIdAndDelete(id);

                if (!entity) {
                    return createFailResponse(`No ${entityNameLower} found with ID: ${id}`, 404);
                }

                // Get updated total count
                const total = await Model.countDocuments();

                return createSuccessResponse(
                    {
                        deleted: true,
                        entity: entity.toObject()
                    },
                    { total }
                );
            });
        },

        // Batch operations with count info
        addMany: (values: T[], type?: string) => {
            return dbOperation(true, async () => {
                if (!Array.isArray(values) || values.length === 0) {
                    return createFailResponse('Invalid array of data provided', 400);
                }

                manageCacheSize();
                const Model = await resolveModel(type);

                try {
                    const entities = await Model.insertMany(values, {
                        ordered: false // Continue on error
                    });

                    // Get updated total count
                    const total = await Model.countDocuments();

                    return createSuccessResponse(
                        {
                            inserted: entities.length,
                            entities: entities.map(e => e.toObject())
                        },
                        { total }
                    );
                } catch (error) {
                    if (error instanceof Error && 'writeErrors' in error) {
                        const bulkError = error as Record<string, []>;
                        const insertedCount = bulkError.insertedDocs?.length || 0;

                        // Get updated total count even if some failed
                        const total = await Model.countDocuments();

                        return createSuccessResponse(
                            {
                                inserted: insertedCount,
                                errors: bulkError.writeErrors,
                                entities: bulkError.insertedDocs || []
                            },
                            { total }
                        );
                    }
                    throw error;
                }
            });
        },

        // Get count with filters from query
        getCount: (query: URLSearchParams = new URLSearchParams(), type?: string) => {
            return dbOperation(false, async () => {
                const { filters } = getMongooseParams(query);
                manageCacheSize();
                const Model = await resolveModel(type);
                const count = await Model.countDocuments(filters);
                return createSuccessResponse({ count });
            });
        },

        // Get total count (no filters)
        getTotalCount: (type?: string) => {
            return dbOperation(false, async () => {
                manageCacheSize();
                const Model = await resolveModel(type);
                const total = await Model.countDocuments();
                return createSuccessResponse({ total });
            });
        },

        // Check if exists
        exists: (query: URLSearchParams = new URLSearchParams(), type?: string) => {
            return dbOperation(false, async () => {
                const { filters } = getMongooseParams(query);

                manageCacheSize();
                const Model = await resolveModel(type);
                const exists = await Model.exists(filters);
                return createSuccessResponse({ exists: !!exists });
            });
        },

        clearCache: () => {
            modelCache.clear();
        }
    };
};