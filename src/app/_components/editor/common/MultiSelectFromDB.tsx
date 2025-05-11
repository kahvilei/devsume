import React, {useEffect, useState} from "react";
import {AlertMessage} from "@/app/_components/common/AlertMessage";
import {useSelection} from "@/app/_hooks/common/useSelection";
import {useAPI} from "@/app/_hooks/common/useAPI";
import ItemOption from "@/app/_components/editor/items/ItemOption";
import ItemEdit from "@/app/_components/editor/items/ItemEdit";
import Modal from "@/app/_components/common/Modal";
import ITEMS, {ItemManifest, ItemManifestList} from "@/config/itemManifest";
import {BaseDataModel, EditProps, PreviewProps} from "@/interfaces/data";
import {DataQuery} from "@/interfaces/api";
import {DataQueryEditor} from "./DataQueryEditor";
import {formatQuerySummary} from "@/lib/db/utils";
import EditableText from "@/app/_components/editor/text/EditableText";
import BinaryToggle from "@/app/_components/editor/common/BinaryToggle";

interface MultiSelectProps<T extends BaseDataModel> {
    values?: T[] | DataQuery<T>;
    label: string;
    placeholder?: string;
    dataKey: keyof ItemManifestList;
    onSelect: (value: T[] | DataQuery<T>) => void;
}

export default function MultiSelectFromDB<T extends BaseDataModel>
({
     values = [],
     label,
     placeholder = "Add items",
     dataKey,
     onSelect
 }: MultiSelectProps<T>) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [editingQuery, setEditingQuery] = useState<boolean>(false);
    const [title, setTitle] = useState<string>(label);

    // Determine if values is a DataQuery object or an array
    const initialIsDynamic = !Array.isArray(values);
    const [isDynamic, setIsDynamic] = useState<boolean>(initialIsDynamic);

    // Initialize query from values if it's a DataQuery, or create an empty one
    const initialQuery: DataQuery<T> = initialIsDynamic
        ? values as DataQuery<T>
        : {filter: {} as Record<keyof T, string>, sort: undefined, limit: undefined};
    const [query, setQuery] = useState<DataQuery<T>>(initialQuery);

    // Get the item manifest and its queryFields (if available)
    const manifest = ITEMS[dataKey] as ItemManifest<T>;
    const queryFields = manifest.queryFields || {};

    // Get the list of items from the API
    const {list, error, warning, createItem, updateItem, deleteItem, fetchItems} = useAPI<T>(
        manifest.api,
        isDynamic ? query : undefined
    );

    // Use the selection hook to manage selected items
    const {
        selectedItems,
        toggleItem,
        isSelected,
        setSelectedItems
    } = useSelection<T>(isDynamic ? [] : (Array.isArray(values) ? values : []), list);

    // Update the parent component when selection changes
    useEffect(() => {
        if (!isDynamic) {
            onSelect(selectedItems);
        }
    }, [selectedItems, isDynamic]);

    // Update the parent component when query changes
    useEffect(() => {
        if (isDynamic) {
            onSelect(query);
            fetchItems().then();
        }
    }, [query, isDynamic]);

    // Update local state when the values prop changes
    useEffect(() => {
        const newIsDynamic = !Array.isArray(values);
        setIsDynamic(newIsDynamic);

        if (newIsDynamic) {
            setQuery(values as DataQuery<T>);
        } else if (Array.isArray(values)) {
            setSelectedItems(values);
        }
    }, []);

    // Type assertions for the preview and edit components
    const PreviewComponent = manifest.preview as React.FC<PreviewProps<T>> | undefined;
    const EditComponent = manifest.edit as React.FC<EditProps<T>> | undefined;
    const openEditInModal = manifest.openEditInModal || false;

    const handleAddItemSave = (item: T): void => {
        createItem(item).then();
        setIsAdding(false);
    };

    const handleQuerySave = (updatedQuery: DataQuery<T>): void => {
        setQuery(updatedQuery);
        setEditingQuery(false);
    };

    return (
        <div className="multi-selector-wrap">
            <div className="multi-selector-controls">
            <div className="multi-selector-header">
                <div className="flex-grow">
                    <EditableText order={'h4'} value={title} label={"title"} placeholder={"Enter a title"} onUpdate={setTitle} />
                </div>
                <BinaryToggle state={isDynamic} onToggle={setIsDynamic} labels={["Static", "Dynamic"]} />
            </div>
            <div className="multi-selector-selector" >
                {(isDynamic ? list.length === 0 : selectedItems.length === 0) && (
                    <div
                        onClick={() => !editingQuery && setIsOpen(!isOpen)}
                        className="item-selector-placeholder"
                    >
                        {isDynamic ? 'No items match query' : placeholder}
                    </div>
                )}

                {isDynamic && (
                    <div className="query-summary">
                        <div className="text-sm">
                            <strong>Query:</strong> {formatQuerySummary(query)}
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingQuery(true);
                            }}
                            className="btn-link text-sm"
                        >
                            Edit Query
                        </button>
                    </div>
                )}

                {/* Different content based on mode and state */}
                {editingQuery ? (
                    <DataQueryEditor
                        query={query}
                        onSave={handleQuerySave}
                        onCancel={() => setEditingQuery(false)}
                        queryFields={queryFields}
                    />
                ) : isOpen && !isDynamic ? (
                    <ul role="listbox" className="divider">
                        {list.map((option: T) => (
                            <ItemOption
                                key={option._id}
                                item={option}
                                onSelect={() => toggleItem(option)}
                                onEdit={updateItem}
                                isSelected={isSelected(option)}
                                onDelete={deleteItem}
                                Renderer={PreviewComponent}
                                Form={EditComponent}
                                openEditInModal={openEditInModal}
                            />
                        ))}
                    </ul>
                ) : null}

                {/* Add new item section - only show if not editing query */}
                {!editingQuery && (
                    <>
                        {isAdding && openEditInModal ? (
                            <Modal
                                isOpen={isAdding}
                                onClose={() => setIsAdding(false)}
                                title="Add new item"
                            >
                                <ItemEdit
                                    label="Add a new item"
                                    Form={EditComponent}
                                    onSave={handleAddItemSave}
                                    onCancel={() => setIsAdding(false)}
                                />
                            </Modal>
                        ) : isAdding ? (
                            <div className="p-sm divider">
                                <ItemEdit
                                    label="Add a new item"
                                    Form={EditComponent}
                                    onSave={handleAddItemSave}
                                    onCancel={() => setIsAdding(false)}
                                />
                            </div>
                        ) : (
                            <div
                                className="add-new-item cursor-pointer"
                                onClick={() => setIsAdding(true)}
                            >
                                + Add new item
                            </div>
                        )}
                    </>
                )}
            </div>
            <AlertMessage error={error} warning={warning}/>
            </div>
            <div
                aria-label={label}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className="multi-selector-content"
            >

                {/* Show selected items for both modes */}
                <ul
                    role="items"
                    onClick={() => !editingQuery && setIsOpen(!isOpen)}
                    className="multi-selector-selected-items"
                    aria-label="Selected Items"
                >
                    {(isDynamic ? list : selectedItems).map((option) => (
                        <ItemOption
                            key={option._id}
                            item={option}
                            onSelect={!isDynamic ? () => toggleItem(option) : undefined}
                            onEdit={updateItem}
                            onDelete={deleteItem}
                            Renderer={PreviewComponent}
                            Form={EditComponent}
                            openEditInModal={openEditInModal}
                        />
                    ))}
                </ul>
            </div>
        </div>
    );
}