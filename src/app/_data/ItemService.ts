import mongoose from "mongoose";
import {action, makeAutoObservable, observable,} from "mobx";
import {BaseDataModel, EditProps, PreviewProps} from "@/interfaces/data";
import {ItemConfig} from "@/config/itemConfig";
import * as api from "@/interfaces/api";
import * as utils from "@/lib/db/utils";
import {getAndReturn} from "@/lib/http/getAndDigest";
import {postAndReturn} from "@/lib/http/postAndDigest";
import {patchAndReturn} from "@/lib/http/patchAndDigest";
import {deleteAndReturn} from "@/lib/http/deleteAndDigest";
import React from "react";


interface QueryResult {
    data: utils.ResponseObject;
    timestamp: number;
}

const convertQueryToString = <T>(query: api.DataQuery<T>) => {
    let queryStr = "?";
    for (const key in query) {
        if (query.hasOwnProperty(key) && key !== "filter") {
            const value = query[key as keyof api.DataQuery<T>];
            queryStr += `${key}=${value}&`;
        } else if (query.hasOwnProperty(key) && key === "filter") {
            for (const filterKey in query.filter) {
                const value = query.filter[filterKey];
                queryStr += `${filterKey}=${value}&`;
            }
        }
    }
    return queryStr.slice(0, -1);
}

export class ItemService<T extends BaseDataModel> implements ItemConfig<T> {
    api: string;
    model?: mongoose.Model<T>;
    preview?: React.FC<PreviewProps<T>>;
    edit?: React.FC<EditProps<T>>;
    openEditInModal?: boolean;
    queryFields?: {
        [key: string]: string
    }
    names?: {
        singular: string;
        plural: string;
    }

    lastItemChange = new Date();

    queries = new Map<string, QueryResult>();
    loading = false;
    error: string | undefined = undefined;
    warning: string | undefined = undefined;


    constructor(config: ItemConfig<T>) {
        this.api = config.api;
        this.preview = config.preview;
        this.edit = config.edit;
        this.openEditInModal = config.openEditInModal;
        this.queryFields = config.queryFields;
        this.names = config.names;
        makeAutoObservable(this);
    }

    setErrorWarning(response: utils.ResponseObject) {
        this.warning = response.warning;
        this.error = response.error;
    }

    async getQuery(query: api.DataQuery<T> | string): Promise<utils.ResponseObject> {
        let queryStr = '';
        if (typeof query === 'string') {
            queryStr = query;
        } else {
            queryStr = convertQueryToString(query);
        }

        const current = this.queries.get(queryStr);
        const cacheAge = current ? Date.now() - current.timestamp : Infinity;

        // If cache is missing or older than 2 minutes since last item change, fetch fresh data
        if (!current || cacheAge > 20000 || current.timestamp < this.lastItemChange.getTime()) {
            return this.fetchItems(query);
        }

        return current.data;
    }

    async fetchItems(query: api.DataQuery<T> | string) {
        this.loading = true;
        let queryStr = '';
        if (typeof query === 'string') {
            queryStr = query;
        } else {
            queryStr = convertQueryToString(query);
        }
        try {
            const data = await getAndReturn(this.api + queryStr);
            this.setErrorWarning(data);
            this.queries.set(queryStr, {data, timestamp: Date.now()});
            this.loading = false;
            return data;
        } catch (err) {
            throw err;
        }
    }

    async createItem(item: T) {
        this.loading = true;
        try {
            const result = await postAndReturn<T>(this.api, item);
            this.setErrorWarning(result);
            this.lastItemChange = new Date();
            this.loading = false;
            return result;
        } catch (err) {
            this.error = err instanceof Error ? err.message : 'Unknown error';
            this.loading = false;
            return {success: false};
        }
    }

    async updateItem(item: T) {
        this.loading = true;
        try {
            const result = await patchAndReturn<T>(this.api + item._id, item);
            this.setErrorWarning(result);
            this.lastItemChange = new Date();
            this.loading = false;
            return result;
        } catch (err) {
            this.error = err instanceof Error ? err.message : 'Unknown error';
            this.loading = false;
            return {success: false};
        }
    }

    async deleteItem(item: T) {
        this.loading = true;
        try {
            const result = await deleteAndReturn(this.api + item._id);
            this.setErrorWarning(result);
            this.lastItemChange = new Date();
            this.loading = false;
            return result;
        } catch (err) {
            this.error = err instanceof Error ? err.message : 'Unknown error';
            this.loading = false;
            return {success: false};
        }
    }
}
