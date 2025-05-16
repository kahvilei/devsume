import {useCallback, useEffect, useMemo, useState} from "react";
import {getAndDigest} from "@/lib/http/getAndDigest";
import {patchAndDigest} from "@/lib/http/patchAndDigest";
import {deleteAndDigest} from "@/lib/http/deleteAndDigest";
import {postAndDigest} from "@/lib/http/postAndDigest";
import {DataQuery} from "@/interfaces/api";
import {BaseDataModel} from "@/interfaces/data";

export function useAPI<T extends BaseDataModel>(url: string, query?: DataQuery<T>) {
    const [list, setList] = useState<T[]>([]);
    const [error, setError] = useState<string>();
    const [warning, setWarning] = useState<string>();
    const [loading, setLoading] = useState(false);

    const convertQueryToString = useCallback((query: DataQuery<T>) => {
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
    }, []);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            await getAndDigest<T[]>(
                url + convertQueryToString(query ?? {}),
                setList,
                setError,
                setWarning
            );
        } finally {
            setLoading(false);
        }
    }, [url, query, convertQueryToString]);

    const createItem = useCallback(async (item: T) => {
        return postAndDigest<T>(
            url,
            item,
            (newItem) => setList(prev => [...prev, newItem]),
            setError,
            setWarning
        );
    }, [url]);

    const updateItem = useCallback(async (item: T) => {
        return patchAndDigest<T>(
            url + item._id,
            item,
            (updatedItem: T) => setList(prev =>
                prev.map(t => t._id === updatedItem._id ? updatedItem : t)
            ),
            setError,
            setWarning
        );
    }, [url]);

    const deleteItem = useCallback(async (item: T) => {
        return deleteAndDigest<T>(
            url + item._id,
            (deletedItem: T) => setList(prev =>
                prev.filter(t => t._id !== deletedItem._id)
            ),
            setError,
            setWarning
        );
    }, [url]);

    const clearError = useCallback(() => setError(undefined), []);
    const clearWarning = useCallback(() => setWarning(undefined), []);

    // Initial fetch on mount or when query changes
    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Memoize the return object
    return useMemo(() => ({
        list,
        error,
        warning,
        loading,
        createItem,
        updateItem,
        deleteItem,
        fetchItems,
        clearError,
        clearWarning
    }), [
        list,
        error,
        warning,
        loading,
        createItem,
        updateItem,
        deleteItem,
        fetchItems,
        clearError,
        clearWarning
    ]);
}