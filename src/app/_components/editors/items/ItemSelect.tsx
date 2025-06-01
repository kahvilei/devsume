import React, {useCallback, useEffect, useId, useMemo, useRef, useState} from "react";
import { Database, ListPlus, Undo, X, Edit3 } from "lucide-react";
import { observer } from "mobx-react-lite";
import { IBaseItem } from "@/server/models/schemas/IBaseItem";
import { Item } from "@/app/_data/Items/Item";
import { ItemSelectList } from "@/app/_components/editors/items/ItemSelectList";
import TextInput from "@/app/_components/input/TextInput";
import Paginator from "@/app/_components/navigation/Paginator";
import { ItemAddAnyOfTypeButton } from "@/app/_components/editors/items/ItemAddButton";
import { ActionIcon } from "@/app/_components/buttons/ActionIcon";
import BinaryToggle from "@/app/_components/buttons/BinaryToggle";
import { DataQueryEditor } from "@/app/_components/editors/DataQueryEditor";
import { Data, DataFilter, DataQuery } from "@/server/models/schemas/data";
import { useFetchItems } from "@/app/_hooks/common/useFetchItems";
import { useConfig } from "@/app/_hooks/common/useConfig";
import {DataService} from "@/app/_data";
import PortalOverlay from "@/app/_components/layouts/PortalOverlay";
import {ItemPreview} from "@/app/_components/editors/items/ItemPreview";
import {ItemList} from "@/app/_components/editors/items/ItemList";

type SelectMode = "single" | "multiple";

// Conditional types based on select mode
export type SelectValue<T extends IBaseItem, Mode extends SelectMode> =
    Mode extends "single"
        ? Item<T>
        : Data<T> ;

type RenderSelectionValue<T extends IBaseItem, Mode extends SelectMode> =
    Mode extends "single"
        ? Item<T>
        : Data<T>;

interface ItemSelectProps<T extends IBaseItem, Mode extends SelectMode = SelectMode> {
    values?: Mode extends "single" ? Item<T> : Item<T>[];
    label?: string;
    type: string;
    searchPageSize?: number;
    selectMode: Mode;
    enableQuery?: boolean;
    openInPopover?: boolean;
    onSelect: (value: SelectValue<T, Mode>) => void;
    renderSelection?: (items: RenderSelectionValue<T, Mode>) => React.ReactNode;
}

export const ItemSelect = observer(<T extends IBaseItem, Mode extends SelectMode>(
    {
        values,
        label = "Select items",
        type,
        searchPageSize = 10,
        selectMode,
        enableQuery = false,
        openInPopover = true,
        onSelect,
        renderSelection,
    }: ItemSelectProps<T, Mode>
) => {
    const [controlsOpen, setControlsOpen] = useState<boolean>(false);
    const [searchPage, setSearchPage] = useState<number>(0);
    const [searchTitleQuery, setSearchTitleQuery] = useState<string>("");
    const [selectedItems, setSelectedItems] = useState<Item<T>[]>(() => {
        if (selectMode === "multiple" && Array.isArray(values)) {
            return values as Item<T>[];
        }
        return [];
    });
    const [selectedItem, setSelectedItem] = useState<Item<T> | undefined>(() => {
        if (selectMode === "single" && values && !Array.isArray(values)) {
            return values as Item<T>;
        }
        return undefined;
    });
    const [queryResults, setQueryResults] = useState<Item<T>[]>([]);
    const [isDynamic, setIsDynamic] = useState<boolean>(enableQuery);

    const renderBoxRef = useRef<HTMLDivElement>(null);

    const initialQuery = useMemo<DataQuery>(() => {
        if (enableQuery && selectMode === "multiple" && values && typeof values === "object" && !Array.isArray(values)) {
            return values as DataQuery;
        }
        return {
            filter: {} as Record<keyof T, DataFilter>,
            sort: undefined,
            limit: undefined,
        };
    }, [enableQuery, selectMode, values]);
    const [query, setQuery] = useState<DataQuery>(initialQuery);

    const { items: list, pageCount } = useFetchItems<T>({
        type,
        searchTitleQuery,
        searchPageSize,
        searchPage,
    });

    const { names } = useConfig(type);

    // Fetch service & query results dynamically
    useEffect(() => {
        if (enableQuery && isDynamic) {
            const fetchData = async () => {
                try {
                    const results = await DataService.getService(type).getQueryResult(query, type);
                    if (results?.content) {
                        setQueryResults(results.content as unknown as Item<T>[]);
                    }
                } catch (error) {
                    console.error("Failed to fetch query results:", error);
                    setQueryResults([]);
                }
            };
            fetchData();
        }
    }, [enableQuery, isDynamic, query, type]);

    // Notify parent of selection changes
    useEffect(() => {
        let result: SelectValue<T, Mode>;
        if (isDynamic) {
            result = query as SelectValue<T, Mode>;
        } else if (selectMode === "single") {
            result = selectedItem as SelectValue<T, Mode>;
        } else {
            result = selectedItems as SelectValue<T, Mode>;
        }
        onSelect(result);
    }, [isDynamic, query, selectedItem, selectedItems, onSelect, selectMode]);

    const handleReset = useCallback(() => {
        if (selectMode === "single") {
            setSelectedItem(undefined);
        } else {
            setSelectedItems([]);
        }
        setQuery({
            filter: {} as Record<keyof T, DataFilter>,
            sort: undefined,
            limit: undefined,
        });
        if (enableQuery && isDynamic) {
            onSelect({} as SelectValue<T, Mode>);
        } else {
            onSelect((selectMode === "single" ? undefined : []) as unknown as SelectValue<T, Mode>);
        }
    }, [selectMode, enableQuery, isDynamic, onSelect]);

    const displayValue: RenderSelectionValue<T, Mode> = (isDynamic ? queryResults : selectMode === "single" ? selectedItem : selectedItems) as RenderSelectionValue<T, Mode>;
    const overlayKey = useId();

    const controls = (
        <div className={`selector-controls ${controlsOpen ? "open" : "closed"}`}>
            <div className="buttons">
                <div>
                    {enableQuery && (
                        <BinaryToggle
                            state={isDynamic}
                            onToggle={() => setIsDynamic(!isDynamic)}
                            label={["Direct select", "Query"]}
                            size="sm"
                            elements={[<ListPlus key="direct" />, <Database key="query" />]}
                        />
                    )}
                    <ActionIcon
                        onClick={handleReset}
                        icon={<Undo />}
                        color="info"
                        size="sm"
                        tooltip={`Reset ${selectMode === "single" ? "selection" : "selection/filter"}`}
                    />
                    <ItemAddAnyOfTypeButton type={type} size="sm" color="primary" />
                </div>
                <ActionIcon
                    icon={<X />}
                    onClick={() => setControlsOpen(!controlsOpen)}
                    size="sm"
                    tooltip="Close controls"
                />
            </div>
            {enableQuery && isDynamic ? (
                <DataQueryEditor
                    query={query}
                    onSave={setQuery}
                    queryFields={DataService.getService(type).getQueryFields(type)}
                    showEditToggle={true}
                    defaultOpen={false}
                />
            ) : (
                <div className="flex flex-col items-center gap-xs">
                    <TextInput
                        label={`Search for ${names?.plural}`}
                        value={searchTitleQuery}
                        onChange={setSearchTitleQuery}
                        placeholder={`Search ${names?.plural}`}
                    />
                    <ItemSelectList<T, Mode>
                        items={list}
                        selectType={selectMode}
                        selected={(selectMode === "single" ? selectedItem : selectedItems) as SelectValue<T, Mode>}
                        onSelect={(
                            selectMode === "single" ? setSelectedItem : setSelectedItems
                        ) as (value: SelectValue<T, Mode>) => void}
                    />
                    <Paginator
                        pages={pageCount}
                        onSelect={setSearchPage}
                        currentPage={searchPage}
                    />
                </div>
            )}
        </div>
    );

    return (
        <div className="multi-selector">
            <div
                className="render-box relative"
                ref={renderBoxRef}
                onClick={() => setControlsOpen(!controlsOpen)}
                aria-label={label}
                aria-haspopup="listbox"
            >
                <ActionIcon
                    icon={<Edit3 />}
                    size="sm"
                    variant="btn-default"
                    tooltip="Edit Selection"
                    onClick={() => setControlsOpen(!controlsOpen)}
                />
                {!displayValue || (Array.isArray(displayValue) && displayValue.length === 0) ? (
                    <div className="item-selector-placeholder">
                        No {selectMode === "single" ? names?.singular : names?.plural} selected. Click here to add.
                    </div>
                ) : renderSelection?.(displayValue)}
            </div>

            {/* Conditionally render controls in a popover or in place */}
            {openInPopover ? (
                <PortalOverlay
                    targetRef={renderBoxRef as React.RefObject<HTMLElement>}
                    isOpen={controlsOpen}
                    overlayKey={overlayKey}
                    onClickOutside={() => setControlsOpen(false)}
                    placement="bottom"
                    className="popover-controls"
                    matchWidth={true}
                >
                    {controls}
                </PortalOverlay>
            ) : controlsOpen ? (
                <div className={`selector ${controlsOpen ? "open" : "closed"}`}>{controls}</div>
            ) : null}
        </div>
    );
});

// Props for both `ItemMultiSelect` and `ItemSingleSelect`
interface CommonItemSelectProps {
    label?: string;
    type: string;
    searchPageSize?: number;
    openInPopover?: boolean;
}

interface SingleSelectProps<T extends IBaseItem> extends CommonItemSelectProps {
    value?: Item<T>;
    onSelect: (value: Item<T>) => void;
    renderSelection?: (item: Item<T>) => React.ReactNode;
}

interface MultiSelectProps<T extends IBaseItem> extends CommonItemSelectProps {
    values?: Data<T>;
    onSelect: (value: Data<T>) => void;
    renderSelection?: (items: Data<T>) => React.ReactNode;
}

/**
 * `ItemMultiSelect` - A wrapper component for multiple item selection.
 */
export const ItemMultiSelect = observer(<T extends IBaseItem>(
    {
        values = [],
        label = "Select items",
        type,
        searchPageSize = 10,
        onSelect,
        renderSelection = (items) => <ItemList items={items as Item<T>[]}/>,
        openInPopover,
    }: MultiSelectProps<T>) => (
    <ItemSelect<T, "multiple">
        values={values as Item<T>[]}
        label={label}
        type={type}
        searchPageSize={searchPageSize}
        selectMode="multiple"
        enableQuery={true}
        onSelect={onSelect}
        renderSelection={renderSelection}
        openInPopover={openInPopover}
    />
));

/**
 * `ItemSingleSelect` - A wrapper component for single item selection.
 */
export const ItemSingleSelect = observer(<T extends IBaseItem>(
    {
        value,
        label = "Select item",
        type,
        searchPageSize = 10,
        onSelect,
        renderSelection = (item) => <ItemPreview item={item as Item<T>}/>,
        openInPopover,
    }: SingleSelectProps<T>) => (
    <ItemSelect<T, "single">
        values={value}
        label={label}
        type={type}
        searchPageSize={searchPageSize}
        selectMode="single"
        enableQuery={false}
        onSelect={onSelect}
        renderSelection={renderSelection}
        openInPopover={openInPopover}
    />
));

export default ItemSelect;