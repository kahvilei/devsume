import {createFailResponse, createSuccessResponse, dbOperation, getMongooseParams} from "@/lib/db/utils";
import {Tag} from "@/models";
import {ITag} from "@/custom/categories/skills/model";

export const getAllTags = () => {
    return dbOperation(async () => {
        const tags = await Tag.find().lean();
        return createSuccessResponse(tags);
    });
}

export const getTags = (query: URLSearchParams) => {
    return dbOperation(async () => {
        const {sort, filters, limit, skip} = getMongooseParams(query);
        console.log(filters, sort, limit, skip);
        const tags = await Tag.find(filters).sort(sort).limit(limit).lean();
        return createSuccessResponse(tags);
    });
}

export const getTagBySlug = (slug: string) => {
    return dbOperation(async () => {
        const tag = await Tag.findOne({slug}).lean();
        if (!tag) {
            return createFailResponse("No tag found with this slug" );
        }
        return createSuccessResponse(tag);
    });
}

export const getTagById = (id: string) => {
    return dbOperation(async () => {
        const tag = await Tag.findById(id).lean();
        if (!tag) {
            return createFailResponse("No tag found with this ID" );
        }
        return createSuccessResponse(tag);
    })
}

export const addTag = (values: ITag) => {
    return dbOperation(async () => {
        const tag = new Tag(values);
        await tag.save();
        return createSuccessResponse(tag);
    })
}

export const updateTag = (id: string, values: ITag) => {
    return dbOperation(async () => {
        const tag = await Tag.findByIdAndUpdate(id, values, {new: true});
        if (!tag) {
            return createFailResponse("No tag found with this ID" );
        }
        return createSuccessResponse(tag);
    })
}

export const deleteTag = (id: string) => {
    return dbOperation(async () => {
        const tag = await Tag.findByIdAndDelete(id);
        if (!tag) {
            return createFailResponse("No tag found with this ID" );
        }
        return createSuccessResponse(tag);
    })
}