import {
    createFailResponse,
    createSuccessResponse,
    dbOperation,
    getMongooseParams,
    ResponseObject
} from "@/lib/db/utils";
import {Model, Document, UpdateQuery} from "mongoose";
import {DataQuery} from "@/server/models/schemas/data";
import {BaseDataModel} from "@/interfaces/data";
import {createModelResolver} from "@/lib/db/model-resolver";

export interface ServiceFactory<TInterface> {
    getAll: (type?: string) => Promise<ResponseObject>;
    get: (query: URLSearchParams, type?: string) => Promise<ResponseObject>;
    getBySlug: (slug: string, type?: string) => Promise<ResponseObject>;
    getById: (id: string, type?: string) => Promise<ResponseObject>;
    add: (values: TInterface, type?: string) => Promise<ResponseObject>;
    update: (id: string, value: Partial<TInterface>, type?: string) => Promise<ResponseObject>;
    delete: (id: string, type?: string) => Promise<ResponseObject>;
    addMany: (values: TInterface[], type?: string) => Promise<ResponseObject>;
    getCount: (filters: DataQuery<TInterface>, type?: string) => Promise<ResponseObject>;
    exists: (filters: DataQuery<TInterface>, type?: string) => Promise<ResponseObject>;
    clearCache: () => void;
}

export const createServiceFactory = <T extends Document, TInterface = BaseDataModel>(
    defaultModel: Model<T>,
    customPath: string,
    entityName: string
): ServiceFactory<TInterface> => {
    const modelCache = new Map<string, object>();
    const resolveModel = createModelResolver(defaultModel, customPath, modelCache);
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
        getCount: (filters: DataQuery<TInterface> = {}, type?: string) => {
            return dbOperation(async () => {
                const Model = await resolveModel(type);
                const count = await Model.countDocuments(filters);
                return createSuccessResponse({ count });
            });
        },

        // Check if exists
        exists: (filters: DataQuery<TInterface>, type?: string) => {
            return dbOperation(async () => {
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