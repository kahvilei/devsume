import mongoose from "mongoose";
import {IResume} from "@/server/models/Resume";
import {IPost} from "@/server/models/Post";
import {ICategory} from "@/server/models/Category";
import {IMedia} from "@/server/models/Media";
import {IBaseItem} from "@/server/models/schemas/IBaseItem";
import {Item} from "@/app/_data/Items/Item";

export type DataType = ICategory | IResume | IPost | IMedia;
export type DataFilter = string | number | string[] | number[];

export interface DataQuery {
    filter?: {
        [k: string]: DataFilter;
    }
    sort?: string;
    limit?: number;
    skip?: number;
}

export const DataQuerySchemaDefinition = {
    filter: {
        type: Object,
        default: {}
    },
    sort: String,
    limit: Number,
    skip: Number
}

export const DataQuerySchema = new mongoose.Schema(DataQuerySchemaDefinition);

export type Data<T extends IBaseItem> = Item<T>[] | DataQuery;

export const DataEnum = {
    type: DataQuerySchema || [mongoose.Schema.Types.ObjectId]
}



