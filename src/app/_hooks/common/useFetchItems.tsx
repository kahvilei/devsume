import {useEffect, useState} from "react";
import {Item} from "@/app/_data/Items/Item";
import {DataService} from "@/app/_data";
import {IBaseItem} from "@/server/models/schemas/IBaseItem";

interface UseFetchItemsProps {
    type: string;
    searchTitleQuery?: string;
    searchPageSize?: number;
    searchPage?: number;
}

export const useFetchItems = <T extends IBaseItem>(
    {
        type,
        searchTitleQuery = "",
        searchPageSize = 10,
        searchPage = 0,
    }: UseFetchItemsProps) => {
    const [items, setItems] = useState<Item<T>[]>([]);
    const [pageCount, setPageCount] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const service = DataService.getService(type);

    useEffect(() => {
        let isCancelled = false;

        const fetchItems = async () => {
            try {
                const results = await service.getQueryResult(
                    {
                        limit: searchPageSize,
                        skip: searchPageSize * searchPage,
                        filter: searchTitleQuery ? {"title.regex": searchTitleQuery} : {},
                    },
                    type
                );
                if (!isCancelled && results?.content) {
                    setItems(results.content as unknown as Item<T>[]);
                    setPageCount(results.pagination?.pages || 1);
                }
            } catch (err) {
                console.error("Failed to fetch items:", err);
                if (!isCancelled) {
                    setError("Failed to fetch items");
                    setItems([]);
                }
            }
        };

        fetchItems();

        return () => {
            isCancelled = true;
        };
    }, [type, searchPageSize, searchPage, searchTitleQuery, service.lastUpdated, service]);

    return {items, pageCount, error};
};
