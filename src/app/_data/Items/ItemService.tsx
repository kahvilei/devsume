import { makeObservable, observable, runInAction} from "mobx";
import { Item } from "./Item";
import { ItemConfig } from "@/config/items";
import { getAndReturn } from "@/lib/http/getAndDigest";
import { postAndReturn } from "@/lib/http/postAndDigest";
import { patchAndReturn } from "@/lib/http/patchAndDigest";
import { deleteAndReturn } from "@/lib/http/deleteAndDigest";
import { convertQueryToString } from "@/lib/misc/convertQuery";
import { DataQuery } from "@/server/models/schemas/data";
import {createFailResponse, PagContent, ResponseObject} from "@/lib/db/utils";
import {IBaseItem, IBaseItem as ItemInterface} from "@/server/models/schemas/IBaseItem";
import React from "react";
import {EditProps, PreviewProps} from "@/interfaces/data";
import {PlusIcon} from "lucide-react";

interface QueryCacheEntry {
    ids: string[];
    timestamp: number;
    pagination?: PagContent;
    error?: string;
    warning?: string;
}

export interface ClientServiceResponse<T extends IBaseItem> {
    content?: Item<T>[] | Item<T> | null;
    error?: string;
    warning?: string;
    pagination?: PagContent;
}

export class ItemService<T extends ItemInterface> {

    private readonly parentConfig: ItemConfig<T>;
    readonly parentType: string;

    // Cache for query results (stores only IDs)
    private queryCache = new Map<string, QueryCacheEntry>();

    // Cache for actual items
    private itemsMap = new Map<string, Item<T>>();

    // Configuration
    private MAX_CACHE_AGE = 20000;
    private MAX_CACHE_QUERIES = 100;

    // State
    @observable loading = false;
    @observable error: string | undefined = undefined;
    @observable warning: string | undefined = undefined;
    @observable lastUpdated: number | undefined = undefined;

    constructor(parentType: string, parentConfig: ItemConfig<T>) {
        this.parentType = parentType;
        this.parentConfig = parentConfig;
        makeObservable(this);
    }

    // Set error and warning from response
    private setErrorWarning(response: ResponseObject) {
        runInAction(() => {
            this.warning = response.warning ?? undefined;
            this.error = response.error;
        })
    }

    // Clean old queries from cache
    private cacheClean() {
        if (this.queryCache.size > this.MAX_CACHE_QUERIES) {
            const sortedQueries = Array.from(this.queryCache.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp);

            const removeCount = Math.floor(this.MAX_CACHE_QUERIES / 2);

            for (let i = 0; i < removeCount && i < sortedQueries.length; i++) {
                this.queryCache.delete(sortedQueries[i][0]);
            }
        }
    }

    getKeysOfType = (key: string) : string[] => {
        const types = [];
        for (const discriminator of this.parentConfig.discriminators as ItemConfig<T>[]) {
            if (discriminator.key === key || key === this.parentType) {
                types.push(discriminator.key)
            }
        }
        return types;
    }

    getAllKeys() {
        const keys = [];
        for (const discriminator of this.parentConfig.discriminators as ItemConfig<T>[]) {
            keys.push(discriminator.key)

        }
        return keys;
    }

    getConfig = (key?: string) : ItemConfig<T>=> {
        if (this.parentConfig.discriminators) {
            for (const discriminator of this.parentConfig.discriminators) {
                if (discriminator.key === key) {
                    return {...this.parentConfig, ...discriminator};
                }
            }
        }
        return this.parentConfig;
    }

    getApiPath = (key: string) : string => {
        const config = this.getConfig(key);
        return config.api;
    }

    getEditElement = (key: string) : React.FC<EditProps<T>> | undefined => {
        const config = this.getConfig(key);
        return config.edit;
    }

    getPreviewElement = (key: string) : React.FC<PreviewProps<T>> | undefined => {
        const config = this.getConfig(key);
        return config.preview;
    }

    getSingularName(key?: string) {
        const config = this.getConfig(key);
        return config.names?.singular ?? this.parentType;
    }
    getQueryFields(key: string): { [key: string]: string; } {
        const config = this.getConfig(key);
        return config.queryFields ?? {};
    }

    getPluralName(dataKey: string) {
        const config = this.getConfig(dataKey);
        return config.names?.plural ?? 'Items';
    }

    getIcon(type: string): React.ReactNode{
        const config = this.getConfig(type);
        return config.icon ?? (<PlusIcon/>);
    }

    // Invalidate all queries (called after any CRUD operation)
    private invalidateAllQueries() {
        this.queryCache.clear();
    }

    // Build full cache key from API path and query
    private buildCacheKey(apiPath: string, query: DataQuery | string): string {
        const queryStr = typeof query === 'string' ? query : convertQueryToString(query);
        return apiPath + queryStr;
    }

    // Update items in the map from response data
    private updateItemsMap(items: T[]): string[] {
        const ids: string[] = [];

        for (const itemData of items) {
            if (itemData._id) {
                const existingItem = this.itemsMap.get(itemData._id);

                if (existingItem) {
                    // Update existing item
                    existingItem.setData(itemData);
                } else {
                    // Create _new item
                    const newItem = new Item<T>(itemData);
                    this.itemsMap.set(itemData._id, newItem);
                }

                ids.push(itemData._id);
            }
        }

        return ids;
    }

    // Build response from cache key
    private buildResponseFromCache(cacheKey: string): ClientServiceResponse<T> {
        const cached = this.queryCache.get(cacheKey);

        if (!cached) {
            return { error: 'Cache entry not found' };
        }

        // If there was an error cached, return it
        if (cached.error) {
            return {
                error: cached.error,
                warning: cached.warning
            };
        }

        const items: Item<T>[] = [];
        const missingIds: string[] = [];

        for (const id of cached.ids) {
            const item = this.itemsMap.get(id);
            if (item) {
                items.push(item);
            } else {
                missingIds.push(id);
            }
        }

        // If any items are missing, we need to refetch
        if (missingIds.length > 0) {
            return { error: 'Cache miss for some items' };
        }

        return {
            content: items,
            pagination: cached.pagination,
            warning: cached.warning
        };
    }

    // Convert server response to client response
    private async buildClientResponse(serverResponsePromise: Promise<ResponseObject>): Promise<ClientServiceResponse<T>> {
        const serverResponse = await serverResponsePromise;

        if (serverResponse.error) {
            return {
                error: serverResponse.error,
                warning: serverResponse.warning
            };
        }

        // Handle empty/null content
        if (!serverResponse.content) {
            return {
                content: null,
                pagination: serverResponse.pagination,
                warning: serverResponse.warning
            };
        }

        // Handle array of items
        if (Array.isArray(serverResponse.content)) {
            const items: Item<T>[] = [];
            for (const itemData of serverResponse.content) {
                if (itemData._id) {
                    const item = this.itemsMap.get(itemData._id);
                    if (item) {
                        items.push(item);
                    }
                }
            }
            return {
                content: items,
                pagination: serverResponse.pagination,
                warning: serverResponse.warning
            };
        }

        // Handle single item
        if ((serverResponse.content as IBaseItem)._id) {
            const item = this.itemsMap.get((serverResponse.content as IBaseItem)._id??'');
            return {
                content: item || null,
                pagination: serverResponse.pagination,
                warning: serverResponse.warning
            };
        }

        return {
            content: null,
            warning: serverResponse.warning,
            pagination: serverResponse.pagination
        };
    }

    // Helper for executing operations
    private async executeOperation(
        operation: () => Promise<ResponseObject>,
        invalidateCache = true
    ): Promise<ResponseObject> {
        this.loading = true;
        try {
            const result = await operation();
            this.setErrorWarning(result);

            if (invalidateCache && !result.error) {
                this.invalidateAllQueries();
            }
            runInAction(
                () => {
                    this.lastUpdated = Date.now();
                    this.loading = false;
                }
            )
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            this.loading = false;
            return createFailResponse({error: `Client error: ${errorMessage}`});
        }
    }

    // Get query results (with caching)
    async getQueryResult(query: DataQuery | string = '', type?: string): Promise<ClientServiceResponse<T>> {
        const apiPath = type ? this.getApiPath(type) : this.parentConfig.api;
        const cacheKey = this.buildCacheKey(apiPath, query);
        const cached = this.queryCache.get(cacheKey);

        // Check if cache is valid
        if (cached && Date.now() - cached.timestamp < this.MAX_CACHE_AGE) {
            const response = this.buildResponseFromCache(cacheKey);
            if (!response.error || response.error === cached.error) {
                // Return cached response if valid or if it's the same error as cached
                return response;
            }
        }

        // Fetch if isn't cached or invalid
        return this.fetchItems(query, type);
    }

    // Fetch items from API
    async fetchItems(query: DataQuery | string = '', type?: string): Promise<ClientServiceResponse<T>> {
        const apiPath = type ? this.getApiPath(type) : this.parentConfig.api;
        const queryStr = typeof query === 'string' ? query : convertQueryToString(query);
        const cacheKey = this.buildCacheKey(apiPath, query);

        const serverResponsePromise = this.executeOperation(async () => {
            const response = await getAndReturn(apiPath + queryStr);

            if (!response.error && response.content) {
                // Update items map and get IDs
                const ids = this.updateItemsMap(response.content as T[]);

                // Cache the query result with all metadata
                this.cacheClean();
                this.queryCache.set(cacheKey, {
                    ids,
                    timestamp: Date.now(),
                    pagination: response.pagination,
                    warning: response.warning
                });
            } else {
                // Cache error responses too
                this.queryCache.set(cacheKey, {
                    ids: [],
                    timestamp: Date.now(),
                    error: response.error,
                    warning: response.warning
                });
            }

            return response;
        }, false);

        return this.buildClientResponse(serverResponsePromise);
    }

    // Create a _new item
    async createItem(item: T, type?: string): Promise<ClientServiceResponse<T>> {
        const apiPath = type ? this.getApiPath(type) : this.parentConfig.api;
        const serverResponsePromise = this.executeOperation(async () => {
            const response = await postAndReturn<T>(apiPath, item);

            // Update items map if successful
            if (!response.error && response.content) {
                this.updateItemsMap([response.content as T]);
            }

            return response;
        });

        return this.buildClientResponse(serverResponsePromise);
    }

    // Update an existing item, falls back to create if there is no id
    async updateItem(item: T, type?: string): Promise<ClientServiceResponse<T>> {
        const apiPath = type ? this.getApiPath(type) : this.parentConfig.api;
        if (!item._id) {
            return this.createItem(item, type);
        }
        const serverResponsePromise = this.executeOperation(async () => {
            const response = await patchAndReturn<T>(apiPath + item._id, item);

            // Update items map if successful
            if (!response.error && response.content) {
                this.updateItemsMap([response.content as T]);
            }

            return response;
        });

        return this.buildClientResponse(serverResponsePromise);
    }

    // Delete an item
    async deleteItem(item: T, type?: string): Promise<ClientServiceResponse<T>> {
        const apiPath = type ? this.getApiPath(type) : this.parentConfig.api;
        const serverResponsePromise = this.executeOperation(async () => {
            const response = await deleteAndReturn(apiPath + item._id);

            // Remove from item map if successful
            if (!response.error && item._id) {
                this.itemsMap.delete(item._id);
            }

            return response;
        });

        return this.buildClientResponse(serverResponsePromise);
    }

    // Get a specific item by ID
    getItemById(id: string): Item<T> | undefined {
        return this.itemsMap.get(id);
    }

    // Get all cached items
    getAllCachedItems(): Item<T>[] {
        return Array.from(this.itemsMap.values());
    }

    // Clear all caches
    clearAllCaches() {
        this.queryCache.clear();
        this.itemsMap.clear();
    }

    //for Items that are reliant on media uploads
    async updateItemAsForm(data: T, type: string) {
        const form = new FormData();
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const element = data[key];
                if (element instanceof File) {
                    form.append(key, element, element.name);
                } else {
                    form.append(key, element as string);
                }
            }
        }
        const apiPath = type ? this.getApiPath(type) : this.parentConfig.api;
        let serverResponse = undefined;
        if (!data._id) {
            serverResponse = this.executeOperation(async () => {
                const response = await postAndReturn<T>(apiPath, form);

                // Update items map if successful
                if (!response.error && response.content) {
                    this.updateItemsMap([response.content as T]);
                }

                return response;
            });
        } else {
            serverResponse = this.executeOperation(async () => {
                const response = await patchAndReturn<T>(apiPath + data._id, form);

                // Update items map if successful
                if (!response.error && response.content) {
                    this.updateItemsMap([response.content as T]);
                }

                return response;
            });
        }
        return serverResponse;

    }
}