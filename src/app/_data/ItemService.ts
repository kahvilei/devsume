import { makeAutoObservable } from "mobx";
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
    private parentConfig: ItemConfig<T>;
    private parentType: string;

    // Cache for query results (stores only IDs)
    private queryCache = new Map<string, QueryCacheEntry>();

    // Cache for actual items
    private itemsMap = new Map<string, Item<T>>();

    // Configuration
    private MAX_CACHE_AGE = 20000;
    private MAX_CACHE_QUERIES = 100;

    // State
    loading = false;
    error: string | undefined = undefined;
    warning: string | undefined = undefined;

    constructor(parentType: string, parentConfig: ItemConfig<T>) {
        this.parentType = parentType;
        this.parentConfig = parentConfig;
        makeAutoObservable(this);
    }

    // Set error and warning from response
    private setErrorWarning(response: ResponseObject) {
        this.warning = response.warning ?? undefined;
        this.error = response.error;
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

    // Invalidate all queries (called after any CRUD operation)
    private invalidateAllQueries() {
        this.queryCache.clear();
    }

    // Build full cache key from API path and query
    private buildCacheKey(apiPath: string, query: DataQuery<T> | string): string {
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
                    existingItem.updateData(itemData);
                } else {
                    // Create new item
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

            this.loading = false;
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            this.loading = false;
            return createFailResponse({error: `Client error: ${errorMessage}`});
        }
    }

    // Get query results (with caching)
    async getQueryResult(apiPath: string, query: DataQuery<T> | string = ''): Promise<ClientServiceResponse<T>> {
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

        // Fetch if not cached or invalid
        return this.fetchItems(apiPath, query);
    }

    // Fetch items from API
    async fetchItems(apiPath: string, query: DataQuery<T> | string = ''): Promise<ClientServiceResponse<T>> {
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

    // Create a new item
    async createItem(apiPath: string, item: T): Promise<ClientServiceResponse<T>> {
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

    // Update an existing item
    async updateItem(apiPath: string, item: T): Promise<ClientServiceResponse<T>> {
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
    async deleteItem(apiPath: string, item: T): Promise<ClientServiceResponse<T>> {
        const serverResponsePromise = this.executeOperation(async () => {
            const response = await deleteAndReturn(apiPath + item._id);

            // Remove from items map if successful
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
}