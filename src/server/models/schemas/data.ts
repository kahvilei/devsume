import mongoose from "mongoose";
import {IResume} from "@/server/models/Resume";
import {IPost} from "@/server/models/Post";
import {ICategory} from "@/server/models/Category";
import {IMedia} from "@/server/models/Media";
import {Item} from "@/server/models/schemas/item";

export type DataType = ICategory | IResume | IPost | IMedia;
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

export type Data<T extends Item> = T[] | DataQuery<T>;

export const DataEnum = {
    type: DataQuerySchema || [mongoose.Schema.Types.ObjectId]
}



