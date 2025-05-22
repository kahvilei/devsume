import mongoose from "mongoose";
import {makeAutoObservable} from "mobx";
import {BaseDataModel, EditProps, PreviewProps} from "@/interfaces/data";
import {ItemConfig} from "@/config/items";
import {getAndReturn} from "@/lib/http/getAndDigest";
import {postAndReturn} from "@/lib/http/postAndDigest";
import {patchAndReturn} from "@/lib/http/patchAndDigest";
import {deleteAndReturn} from "@/lib/http/deleteAndDigest";
import React from "react";
import {convertQueryToString} from "@/lib/misc/convertQuery";
import {DataQuery} from "@/server/models/schemas/data";
import {ResponseObject} from "@/lib/db/utils";

interface QueryResult {
    data: ResponseObject;
    timestamp: number;
}

interface FailureObject {
    error: string;
    warning?: string;
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

    MAX_CACHE_AGE = 20000;
    MAX_CACHE_QUERIES = 100;

    lastItemChange = Date.now();
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

    setErrorWarning(response: ResponseObject | FailureObject) {
        this.warning = response.warning ?? undefined;
        this.error = response.error;
    }

    cacheClean() {
        if (this.queries.size > this.MAX_CACHE_QUERIES) {
            //sort by query age, then remove the oldest half of max
            const sortedQueries = Array.from(this.queries.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp);

            // Remove the oldest half of MAX_CACHE_QUERIES
            const removeCount = Math.floor(this.MAX_CACHE_QUERIES / 2);

            // Remove oldest entries
            for (let i = 0; i < removeCount && i < sortedQueries.length; i++) {
                this.queries.delete(sortedQueries[i][0]);
            }
        }
    }


    // Helper method to process query into a string
    private getQueryString(query: DataQuery<T> | string): string {
        return typeof query === 'string' ? query : convertQueryToString(query);
    }

    // Helper method for common operation pattern
    private async executeOperation(
        operation: () => Promise<ResponseObject | FailureObject>,
        updateCache = true
    ): Promise<ResponseObject | FailureObject> {
        this.loading = true;
        try {
            const result = await operation();
            this.setErrorWarning(result);

            if (updateCache) {
                this.lastItemChange = Date.now();
            }

            this.loading = false;
            return result;
        } catch (err) {
            this.error = err instanceof Error ? err.message : 'Unknown error';
            this.loading = false;
            return {error: (err instanceof Error ? err.message : 'Unknown error')}
        }
    }

    async getQueryResult(query: DataQuery<T> | string): Promise<ResponseObject | FailureObject> {
        const queryStr = this.getQueryString(query);
        const current = this.queries.get(queryStr);// 20 seconds

        if (!current ||
            Date.now() - current.timestamp > this.MAX_CACHE_AGE ||
            current.timestamp < this.lastItemChange) {
            return this.fetchItems(query);
        }

        return current.data;
    }

    async fetchItems(query: DataQuery<T> | string): Promise<ResponseObject | FailureObject> {
        const queryStr = this.getQueryString(query);

        return this.executeOperation(async () => {
            const data = await getAndReturn(this.api + queryStr);
            this.cacheClean();
            this.queries.set(queryStr, {data, timestamp: Date.now()});
            return data;
        }, false);
    }

    async createItem(item: T): Promise<ResponseObject | FailureObject> {
        return this.executeOperation(() => postAndReturn<T>(this.api, item));
    }

    async updateItem(item: T): Promise<ResponseObject | FailureObject> {
        return this.executeOperation(() => patchAndReturn<T>(this.api + item._id, item));
    }

    async deleteItem(item: T): Promise<ResponseObject | FailureObject> {
        return this.executeOperation(() => deleteAndReturn(this.api + item._id));
    }
}