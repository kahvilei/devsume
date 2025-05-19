import mongoose from "mongoose";
import { makeAutoObservable, runInAction, action, observable } from "mobx";
import { BaseDataModel, EditProps, PreviewProps } from "@/interfaces/data";
import { ItemConfig } from "@/config/itemConfig";
import { DataQuery } from "@/interfaces/api";
import { ResponseObject } from "@/lib/db/utils";
import { getAndReturn } from "@/lib/http/getAndDigest";
import { postAndReturn } from "@/lib/http/postAndDigest";
import { patchAndReturn } from "@/lib/http/patchAndDigest";
import { deleteAndReturn } from "@/lib/http/deleteAndDigest";
import React, {useCallback} from "react";


interface QueryResult {
    data: ResponseObject;
    timestamp: number;
}

const convertQueryToString = <T>(query: DataQuery<T>) => {
    let queryStr = "?";
    for (const key in query) {
        if (query.hasOwnProperty(key) && key !== "filter") {
            const value = query[key as keyof DataQuery<T>];
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

    @observable.shallow queries = new Map<DataQuery<T>, QueryResult>();
    @observable loading = false;
    @observable error: string | null = null;

    constructor(config: ItemConfig<T>) {
        makeAutoObservable(this, {
            queries: observable.shallow,
            getQuery: action,
            createItem: action,
            updateItem: action,
            deleteItem: action,
        });

        this.api = config.api;
        this.preview = config.preview;
        this.edit = config.edit;
        this.openEditInModal = config.openEditInModal;
        this.queryFields = config.queryFields;
        this.names = config.names;
    }

    async getQuery(query: DataQuery<T>): Promise<ResponseObject> {
        const current = this.queries.get(query);
        if (current) {
            return current.data;
        }

        this.loading = true;
        try {
            const data = await getAndReturn(this.api+convertQueryToString(query));
            runInAction(() => {
                this.queries.set(query, { data, timestamp: Date.now() });
                this.loading = false;
            });
            return data;
        } catch (err) {
            runInAction(() => {
                this.error = err instanceof Error ? err.message : 'Unknown error';
                this.loading = false;
            });
            throw err;
        }
    }

    async createItem(item: T) {
        this.loading = true;
        try {
            const result = await postAndReturn<T>(this.api, item);

            runInAction(() => {
                if (result.success) {
                    // Refresh all queries
                    const queryArray = Array.from(this.queries.keys());
                    for (const query of queryArray) {
                        this.getQuery(query);
                    }
                }
                this.loading = false;
            });

            return result;
        } catch (err) {
            runInAction(() => {
                this.error = err instanceof Error ? err.message : 'Unknown error';
                this.loading = false;
            });
            return { success: false };
        }
    }

    async updateItem(item: T) {
        this.loading = true;
        try {
            const result = await patchAndReturn<T>(this.api + item._id, item);

            runInAction(() => {
                if (result.success) {
                    this.queries.forEach(query => {
                        if (query.data.content) {
                            const content = query.data.content as T[];
                            if (content.some(i => i._id === item._id)) {
                                query.data.content = content.map(i =>
                                    i._id === item._id ? item : i
                                );
                            }
                        }
                    });
                }
                this.loading = false;
            });

            return result;
        } catch (err) {
            runInAction(() => {
                this.error = err instanceof Error ? err.message : 'Unknown error';
                this.loading = false;
            });
            return { success: false };
        }
    }


    async deleteItem(item: T) {
        this.loading = true;
        try {
            const result = await deleteAndReturn(this.api + item._id);

            runInAction(() => {
                if (result.success) {
                    this.queries.forEach(query => {
                        if (query.data.content) {
                            const content = query.data.content as T[];
                            if (content.some(i => i._id === item._id)) {
                                query.data.content = content.filter(i =>
                                    i._id !== item._id
                                );
                            }
                        }
                    });
                }
                this.loading = false;
            });

            return result;
        } catch (err) {
            runInAction(() => {
                this.error = err instanceof Error ? err.message : 'Unknown error';
                this.loading = false;
            });
            return { success: false };
        }
    }

    clearError() {
        this.error = null;
    }
}
