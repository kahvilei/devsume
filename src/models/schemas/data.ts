import mongoose from "mongoose";

import {ITag} from "@/custom/categories/skills/model";
import {IResume} from "@/models/Resume";
import {IPost} from "@/models/Post";
import {IPerson} from "@/custom/categories/collaborator/model";
import {IImage} from "@/models/Image";
import {BaseDataModel} from "@/interfaces/data";

export type DataType = ITag | IResume | IPost | IPerson | IImage;
export type DataFilter = string | number | string[] | number[];

export interface DataQuery<T> {
    filter?: {
        [K in keyof T]?: DataFilter;
    }
    sort?: string;
    limit?: number;
}

export const DataQuerySchemaDefinition = {
    filter: {
        type: Object,
        default: {}
    },
    sort: String,
    limit: Number
}

export const DataQuerySchema = new mongoose.Schema(DataQuerySchemaDefinition);

export type Data<T extends BaseDataModel> = T[] | DataQuery<T>;

export const DataEnum = {
    type: DataQuerySchema || [mongoose.Schema.Types.ObjectId]
}



