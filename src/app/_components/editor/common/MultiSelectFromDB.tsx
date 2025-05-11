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
import EditableText from "@/app/_components/editor/text/EditableText";
import BinaryToggle from "@/app/_components/editor/common/BinaryToggle";
import {Database, ListPlus, MoveDown, Plus, SettingsIcon} from "lucide-react";
import {ActionIcon} from "@/app/_components/common/ActionIcon";
import {Button} from "@/app/_components/common/Button";
import {DataQueryEditor} from "@/app/_components/editor/common/DataQueryEditor";

interface MultiSelectProps<T extends BaseDataModel> {
    values?: T[] | DataQuery<T>;
    label: string;
    dataKey: keyof ItemManifestList;
    onSelect: (value: T[] | DataQuery<T>) => void;
}

export default function MultiSelectFromDB<T extends BaseDataModel>
({
     values = [],
     label,
     dataKey,
     onSelect
 }: MultiSelectProps<T>) {
    const [controlsOpen, setControlsOpen] = useState<boolean>(false);
    const [isAdding, setIsAdding] = useState<boolean>(false);
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
    };

    return (
        <div className="multi-selector-wrap">
            <div className="multi-selector-controls">
                <div className="multi-selector-header">
                    <div className="flex-grow">
                        <EditableText order={'h4'} value={title}
                                      label={(manifest.names?.singular ?? dataKey) + " section title"}
                                      placeholder={"Enter a title"} onUpdate={setTitle}/>
                    </div>
                    <BinaryToggle state={isDynamic} onToggle={setIsDynamic} label={["Direct select", "Query"]}
                                  elements={[<ListPlus key={1}/>, <Database key={2}/>]}/>
                    <ActionIcon icon={<SettingsIcon/>} action={() => setControlsOpen(!controlsOpen)}
                                tooltip={controlsOpen ? "Hide controls" : "Show controls"}/>
                </div>
                <div className={"multi-selector-selector " + (controlsOpen ? "open" : "closed")}>

                    {isDynamic && (
                        <DataQueryEditor
                            query={query}
                            onSave={handleQuerySave}
                            onCancel={() => {}} // No-op since we're always showing the summary
                            queryFields={queryFields}
                            showEditToggle={true}
                            defaultOpen={false}
                        />
                    )}

                    {/* Different content based on mode and state */}
                    {!isDynamic ? (
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

                    {/* Add new item section */}
                    {isAdding && openEditInModal && (
                        <Modal
                            isOpen={isAdding}
                            onClose={() => setIsAdding(false)}
                            title={"Create a new " + (manifest.names?.singular ?? dataKey)}
                        >
                            <ItemEdit
                                label="Add a new item"
                                Form={EditComponent}
                                onSave={handleAddItemSave}
                                onCancel={() => setIsAdding(false)}
                            />
                        </Modal>
                    )}

                    {isAdding && !openEditInModal && (
                        <div className="p-sm divider">
                            <ItemEdit
                                label="Add a new item"
                                Form={EditComponent}
                                onSave={handleAddItemSave}
                                onCancel={() => setIsAdding(false)}
                            />
                        </div>
                    )}

                    <Button className={"primary"} onClick={() => setIsAdding(true)} icon={<Plus/>}
                            text={"Create a new " + (manifest.names?.singular ?? dataKey)}></Button>
                </div>
                <div className='connector'><MoveDown height={'1rem'}/></div>
                <AlertMessage error={error} warning={warning}/>
            </div>

            <div
                aria-label={label}
                aria-haspopup="listbox"
                className="multi-selector-content"
            >
                {(isDynamic ? list.length === 0 : selectedItems.length === 0) && (
                    <div
                        className="item-selector-placeholder"
                    >
                        No {manifest.names?.plural ?? "items"} selected. Click settings to add new items or edit the
                        query.
                    </div>
                )}

                {/* Show selected items for both modes */}
                <ul
                    role="items"
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