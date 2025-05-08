import {useEffect, useState} from "react";
import {getAndDigest} from "@/lib/http/getAndDigest";
import {patchAndDigest} from "@/lib/http/patchAndDigest";
import {deleteAndDigest} from "@/lib/http/deleteAndDigest";
import {postAndDigest} from "@/lib/http/postAndDigest";
import {BaseDataModel} from "@/interfaces/api";

export function useAPI<T extends BaseDataModel>(url: string, query?: string) {
    const [list, setList] = useState<T[]>([]);
    const [error, setError] = useState<string>();
    const [warning, setWarning] = useState<string>();
    const [loading, setLoading] = useState(false);

    // Fetch tags on mount
    useEffect(() => {
        fetchItems().then();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        getAndDigest<T[]>(url+(query??""), setList, setError, setWarning).then();
        setLoading(false);
    };

    const createItem = async (item: T) => {
        return postAndDigest<T>(
            url,
            item,
            (newItem) => setList(prev => [...prev, newItem]),
            setError,
            setWarning
        );
    };

    const updateItem = async (item: T) => {
        return patchAndDigest<T>(
            url+item._id,
            item,
            (updatedItem: T) => setList(prev => prev.map(t => t._id === updatedItem._id ? updatedItem : t)),
            setError,
            setWarning
        );
    };

    const deleteItem = async (item: T) => {
        return deleteAndDigest<T>(
            url+item._id,
            (deletedItem: T) => setList(prev => prev.filter(t => t._id !== deletedItem._id)),
            setError,
            setWarning
        );
    };

    return {
        list,
        error,
        warning,
        loading,
        createItem,
        updateItem,
        deleteItem,
        clearError: () => setError(undefined),
        clearWarning: () => setWarning(undefined)
    };
}