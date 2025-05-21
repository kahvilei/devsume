import {createFailResponse, createSuccessResponse, dbOperation, getMongooseParams} from "@/lib/db/utils";
import {Category} from "@/models";
import {ICategory} from "@/models/Category";

const resolveType = async (type?: string) => {
    if (!type) return Category;
    try {
        // Dynamic import of the model based on type
        return (await import(`@/custom/categories/${type}/model`)).default;
    } catch (error) {
        // If model doesn't exist for the type, fallback to default Category
        return Category;
    }
}


export const getAllCategories = (type?: string) => {
    return dbOperation(async () => {
        const Model = await resolveType(type);
        const categories = await Model.find().lean();
        return createSuccessResponse(categories);
    });
}

export const getCategories = (query: URLSearchParams, type?: string) => {
    return dbOperation(async () => {
        const {sort, filters, limit, skip} = getMongooseParams(query);
        const Model = await resolveType(type);
        const categories = await Model.find(filters).sort(sort).limit(limit).lean();
        return createSuccessResponse(categories);
    });
}

export const getCategoryBySlug = (slug: string, type?: string) => {
    return dbOperation(async () => {
        const Model = await resolveType(type);
        const category = await Model.findOne({slug}).lean();
        if (!category) {
            return createFailResponse("No categories found with this slug" );
        }
        return createSuccessResponse(category);
    });
}

export const getCategoryById = (id: string, type?: string) => {
    return dbOperation(async () => {
        const Model = await resolveType(type);
        const category = await Model.findById(id).lean();
        if (!category) {
            return createFailResponse("No categories found with this ID" );
        }
        return createSuccessResponse(category);
    })
}

export const addCategory = (values: ICategory, type?: string) => {
    return dbOperation(async () => {
        const Model = await resolveType(type);
        const category = new Model(values);
        await category.save();
        return createSuccessResponse(category);
    })
}

export const updateCategory = (id: string, values: ICategory, type?: string) => {
    return dbOperation(async () => {
        const Model = await resolveType(type);
        const category = await Model.findByIdAndUpdate(id, values, {new: true});
        if (!category) {
            return createFailResponse("No categories found with this ID" );
        }
        return createSuccessResponse(category);
    })
}

export const deleteCategory = (id: string, type?: string) => {
    return dbOperation(async () => {
        const Model = await resolveType(type);
        const category = await Model.findByIdAndDelete(id);
        if (!category) {
            return createFailResponse("No categories found with this ID" );
        }
        return createSuccessResponse(category);
    })
}