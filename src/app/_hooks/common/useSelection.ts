import {useEffect, useState} from "react";

/**
 * A generic hook for managing selection of items
 * @param initialItems - Initial selected items
 * @param idField - The field to use as the unique identifier (defaults to '_id')
 * @param sourceList - The list of items to select from (defaults to []). When this is updated, the selected items will be updated to only include items from the source list.
 * @returns Selection utilities
 */
export function useSelection<T>(
    initialItems: T[] = [],
    sourceList: T[] = [],
    idField: keyof T = '_id' as keyof T
) {
    const [selectedItems, setSelectedItems] = useState<T[]>(initialItems);

    useEffect(() => {
        // Update selected items to only include items from the source list, also update values within the selected items
        let newSelectedItems = sourceList.filter(i => selectedItems.some(s => s[idField] === i[idField]));
        newSelectedItems = newSelectedItems.map(i => i = sourceList.find(s => s[idField] === i[idField])!);
        setSelectedItems(newSelectedItems);
    }, [sourceList, idField]);

    // Toggle an item's selection status
    const toggleItem = (item: T) => {
        setSelectedItems(prev =>
            prev.some(i => i[idField] === item[idField])
                ? prev.filter(i => i[idField] !== item[idField])
                : [...prev, item]
        );
    };

    // Add an item to selection
    const addItem = (item: T) => {
        if (!isSelected(item)) {
            setSelectedItems(prev => [...prev, item]);
        }
    };

    // Remove an item from selection
    const removeItem = (item: T) => {
        setSelectedItems(prev =>
            prev.filter(i => i[idField] !== item[idField])
        );
    };

    // Check if an item is selected
    const isSelected = (item: T): boolean => {
        return selectedItems.some(i => i[idField] === item[idField]);
    };

    // Update an item in both the selection
    const updateItem = (updatedItem: T) => {
        setSelectedItems(prev =>
            prev.map(i => i[idField] === updatedItem[idField] ? updatedItem : i)
        );
    };

    return {
        selectedItems,
        setSelectedItems,
        toggleItem,
        addItem,
        removeItem,
        isSelected,
        updateItem,
        count: selectedItems.length,
        clear: () => setSelectedItems([])
    };
}