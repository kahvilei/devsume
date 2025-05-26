import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertMessage } from "@/app/_components/display/AlertMessage";
import ItemEdit from "@/app/_components/editors/items/ItemEdit";
import Modal from "@/app/_components/layouts/Modal";
import { ItemManifestList } from "@/config/items";
import BinaryToggle from "@/app/_components/buttons/BinaryToggle";
import { Database, ListPlus, MoveDown, SettingsIcon, Undo } from "lucide-react";
import { ActionIcon } from "@/app/_components/buttons/ActionIcon";
import { DataQueryEditor } from "@/app/_components/editors/DataQueryEditor";
import { DataService } from "@/app/_data";
import { observer } from "mobx-react-lite";
import { Data, DataFilter, DataQuery } from "@/server/models/schemas/data";
import { IBaseItem } from "@/server/models/schemas/IBaseItem";
import { Item } from "@/app/_data/Items/Item";
import { ItemMultipleSelect } from "@/app/_components/editors/items/ItemSelectList";
import { ItemList } from "@/app/_components/editors/items/ItemList";
import TextInput from "@/app/_components/input/TextInput";
import Paginator from "@/app/_components/input/Paginator";

interface ItemSelectProps<T extends IBaseItem> {
    values?: Data<T>;
    label?: string;
    type: string;
    searchPageSize?: number;
    onSelect: (value: Data<T>) => void;
}

export const ItemSelectFromDB = observer(<T extends IBaseItem>(
    {
        values = [],
        label = "Select items",
        type,
        searchPageSize = 10,
        onSelect,
    }: ItemSelectProps<T>
) => {
    const [controlsOpen, setControlsOpen] = useState<boolean>(false);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [selectedItems, setSelectedItems] = useState<Item<T>[]>([]);
    const [queryResults, setQueryResults] = useState<Item<T>[]>([]);
    const [list, setList] = useState<Item<T>[]>([]);
    const [searchPage, setSearchPage] = useState<number>(0);
    const [searchTitleQuery, setSearchTitleQuery] = useState<string>("");
    const [pageCount, setPageCount] = useState<number>(1);

    // Determine if values is a Data object or an array
    const initialIsDynamic = useMemo(() => !Array.isArray(values), [values]);
    const [isDynamic, setIsDynamic] = useState<boolean>(initialIsDynamic);


    // Initialize query from values if it's a Data, or create an empty one
    const initialQuery = useMemo<DataQuery<T>>(() => {
        if (initialIsDynamic && typeof values === 'object' && values !== null) {
            return values as DataQuery<T>;
        }
        return {
            filter: {} as Record<keyof T, DataFilter>,
            sort: undefined,
            limit: undefined
        } as DataQuery<T>;
    }, [initialIsDynamic, values]);

    const [query, setQuery] = useState<DataQuery<T>>(initialQuery);

    const service = useMemo(() =>
        DataService.getService(type as keyof ItemManifestList),
        [type]
    );

    // Initialize selectedItems from values if not dynamic
    useEffect(() => {
        if (!isDynamic && Array.isArray(values)) {
            setSelectedItems(values as unknown as Item<T>[]);
        } else if (isDynamic) {
            const fetchData = async () => {
                try {
                    const results = await service.getQueryResult(query,type);
                    if (results?.content) {
                        setQueryResults(results.content as unknown as Item<T>[]);
                    }
                } catch (error) {
                    console.error('Failed to fetch items:', error);
                    setQueryResults([]);
                }
            };

            fetchData();
        }
    }, [isDynamic, query]);


    // Fetch list based on query
    useEffect(() => {
        let isCancelled = false;

        const fetchData = async () => {
            try {
                const results = await service.getQueryResult({limit: searchPageSize, skip: (searchPageSize * searchPage), filter: { title: searchTitleQuery}},type);
                if (!isCancelled && results?.content) {
                    setList(results.content as unknown as Item<T>[]);
                    setPageCount(results?.pagination?.pages ?? 1);
                }
            } catch (error) {
                console.error('Failed to fetch items:', error);
                if (!isCancelled) {
                    setList([]);
                }
            }
        };

        fetchData();

        return () => {
            isCancelled = true;
        };
    }, [service, type]);

    // Notify parent of selection changes
    useEffect(() => {
        const result = isDynamic
            ? query
            : selectedItems.map(item => item.getData());
        onSelect(result as Data<T>);
    }, [isDynamic, query, selectedItems, onSelect]);

    const handleReset = useCallback(() => {
        const emptyValue = isDynamic ? {} as DataQuery<T> : [];
        onSelect(emptyValue as Data<T>);
        setSelectedItems([]);
        setQuery({
            filter: {} as Record<keyof T, DataFilter>,
            sort: undefined,
            limit: undefined
        } as DataQuery<T>);
    }, [isDynamic, onSelect]);

    const displayItems = isDynamic ? queryResults : selectedItems;
    const hasItems = displayItems.length > 0;
    const pluralName = service.getPluralName(type) ?? "items";
    const singularName = service.getSingularName(type) ?? type;

    return (
        <div className="multi-selector">
            <div className="controls">
                <div className="header">
                    <ActionIcon
                        icon={<SettingsIcon />}
                        onClick={() => setControlsOpen(!controlsOpen)}
                        size="sm"
                        tooltip={controlsOpen ? "Hide controls" : "Show controls"}
                    />
                </div>

                <div className={`selector ${controlsOpen ? "open" : "closed"}`}>
                    {controlsOpen && (
                        <div>
                            <div className="buttons">
                                <ActionIcon
                                    onClick={handleReset}
                                    icon={<Undo />}
                                    color="info"
                                    size="sm"
                                    tooltip="Reset filters"
                                />
                                <BinaryToggle
                                    state={isDynamic}
                                    onToggle={() => setIsDynamic(!isDynamic)}
                                    label={["Direct select", "Query"]}
                                    size="sm"
                                    elements={[
                                        <ListPlus key="direct" />,
                                        <Database key="query" />
                                    ]}
                                />
                            </div>

                            {isDynamic ? (
                                <DataQueryEditor
                                    query={query}
                                    onSave={setQuery}
                                    queryFields={service.getQueryFields(type)}
                                    showEditToggle={true}
                                    defaultOpen={false}
                                />
                            ) : (
                                <div className="flex items-center gap-xs">
                                    <TextInput label={"Search for items"} value={searchTitleQuery} onChange={setSearchTitleQuery} placeholder={`Search ${pluralName}`} />
                                    <ItemMultipleSelect
                                        items={list}
                                        selected={selectedItems}
                                        onSelect={setSelectedItems}
                                    />
                                    <Paginator pages={pageCount} onSelect={setSearchPage}/>
                                </div>
                            )}

                        </div>
                    )}
                </div>

                <div className="connector">
                    <MoveDown height="1rem" />
                </div>
            </div>

            <div aria-label={label} aria-haspopup="listbox" className="content">
                {!hasItems && (
                    <div className="item-selector-placeholder">
                        No {pluralName} selected. Click settings to add new items or edit the query.
                    </div>
                )}
                <ItemList items={displayItems} />
            </div>

            <AlertMessage error={service.error} warning={service.warning}/>

            {isAdding && (
                <Modal
                    isOpen={isAdding}
                    onClose={() => setIsAdding(false)}
                    title={`Create a new ${singularName}`}
                >
                    <ItemEdit
                        item={new Item({ title: "" }, type)}
                        label="Add a new item"
                        onCancel={() => setIsAdding(false)}
                    />
                </Modal>
            )}
        </div>
    );
});

export default ItemSelectFromDB;