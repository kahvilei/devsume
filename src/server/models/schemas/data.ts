import mongoose from "mongoose";
import {IResume} from "@/server/models/Resume";
import {IPost} from "@/server/models/Post";
import {IImage} from "@/server/models/Media";
import {BaseDataModel} from "@/interfaces/data";
import {ICategory} from "@/server/models/Category";

export type DataType = ICategory | IResume | IPost | IImage;
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



