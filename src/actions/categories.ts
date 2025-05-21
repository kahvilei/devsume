import {createFailResponse, createSuccessResponse, dbOperation, getMongooseParams} from "@/lib/db/utils";
import {Category} from "@/models";
import {ICategory} from "@/models/Category";

export const getAllCategories = () => {
    return dbOperation(async () => {
        const categories = await Category.find().lean();
        return createSuccessResponse(categories);
    });
}

export const getCategories = (query: URLSearchParams) => {
    return dbOperation(async () => {
        const {sort, filters, limit, skip} = getMongooseParams(query);
        console.log(filters, sort, limit, skip);
        const categories = await Category.find(filters).sort(sort).limit(limit).lean();
        return createSuccessResponse(categories);
    });
}

export const getCategoryBySlug = (slug: string) => {
    return dbOperation(async () => {
        const category = await Category.findOne({slug}).lean();
        if (!category) {
            return createFailResponse("No categories found with this slug" );
        }
        return createSuccessResponse(category);
    });
}

export const getCategoryById = (id: string) => {
    return dbOperation(async () => {
        const category = await Category.findById(id).lean();
        if (!category) {
            return createFailResponse("No categories found with this ID" );
        }
        return createSuccessResponse(category);
    })
}

export const addCategory = (values: ICategory) => {
    return dbOperation(async () => {
        const category = new Category(values);
        await category.save();
        return createSuccessResponse(category);
    })
}

export const updateCategory = (id: string, values: ICategory) => {
    return dbOperation(async () => {
        const category = await Category.findByIdAndUpdate(id, values, {new: true});
        if (!category) {
            return createFailResponse("No categories found with this ID" );
        }
        return createSuccessResponse(category);
    })
}

export const deleteCategory = (id: string) => {
    return dbOperation(async () => {
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return createFailResponse("No categories found with this ID" );
        }
        return createSuccessResponse(category);
    })
}