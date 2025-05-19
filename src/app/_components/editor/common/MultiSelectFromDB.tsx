
import React, {useEffect, useState} from "react";
import {AlertMessage} from "@/app/_components/common/AlertMessage";
import {useSelection} from "@/app/_hooks/common/useSelection";
import ItemOption from "@/app/_components/editor/items/ItemOption";
import ItemEdit from "@/app/_components/editor/items/ItemEdit";
import Modal from "@/app/_components/common/Modal";
import ITEMS, {ItemConfig, ItemManifestList} from "@/config/itemConfig";
import {BaseDataModel} from "@/interfaces/data";
import {DataFilter, DataQuery} from "@/interfaces/api";
import EditableText from "@/app/_components/editor/text/EditableText";
import BinaryToggle from "@/app/_components/common/BinaryToggle";
import {Database, ListPlus, MoveDown, Plus, SettingsIcon, Undo, X} from "lucide-react";
import {ActionIcon} from "@/app/_components/common/ActionIcon";
import {DataQueryEditor} from "@/app/_components/editor/common/DataQueryEditor";
import PopInOut from "@/app/_components/animations/PopInOut";
import {AnimatePresence} from "motion/react";
import Drawer from "../../animations/Drawer";
import {DataService} from "@/app/_data";
import {observer} from "mobx-react-lite"

interface MultiSelectProps<T extends BaseDataModel> {
    values?: T[] | DataQuery<T>;
    label: string;
    dataKey: keyof ItemManifestList;
    onSelect: (value: T[] | DataQuery<T>) => void;
    onRemove?: () => void;
}

export const MultiSelectFromDB = observer(<T extends BaseDataModel>({
    values = [],
    label,
    dataKey,
    onSelect,
    onRemove
}: MultiSelectProps<T>) =>
{
    const [controlsOpen, setControlsOpen] = useState<boolean>(false);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [title, setTitle] = useState<string>(label);

    // Get the item manifest and its queryFields (if available)
    const manifest = ITEMS[dataKey] as ItemConfig<T>;
    const {
        queryFields = {},
        preview: PreviewComponent,
        edit: EditComponent,
        openEditInModal = false
    } = manifest;

    // Determine if values is a DataQuery object or an array
    const initialIsDynamic = !Array.isArray(values);
    const [isDynamic, setIsDynamic] = useState<boolean>(initialIsDynamic);

    // Initialize query from values if it's a DataQuery, or create an empty one
    const initialQuery:
        DataQuery<T> = initialIsDynamic
        ? values as DataQuery<T>
        : {filter: {} as Record<keyof T, DataFilter[]>, sort: undefined, limit: undefined} as DataQuery<T>;

    const [query, setQuery] = useState<DataQuery<T>>(initialQuery);
    const [list, setList] = useState<T[]>([]);

    const service = DataService[dataKey as keyof typeof DataService];
    useEffect(() => {
        service.getQuery(query).then(
            (results) => {
                setList(results.content as T[]);
            }
        )
    }, [query, service]);

    const updateItem = service.updateItem;
    const deleteItem = service.deleteItem;

    const [error, setError] = useState<string>();
    const [warning, setWarning] = useState<string>();


    // Use the selection hook to manage selected items
    const {
        selectedItems,
        toggleItem,
        isSelected,
        setSelectedItems
    } = useSelection<T>(isDynamic ? list : (Array.isArray(values) ? values : []), list);


    const handleAddItemSave = async (item: T) => {
        await service.createItem(item);
        setIsAdding(false);
    };

    useEffect(() => {
        onSelect(isDynamic ? query : selectedItems);
        // Intentionally omitting onSelect from dependencies:
        // We don't want to re-run this effect when the component receives
        // a copy of the same function as a prop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDynamic, query, selectedItems]);

    return (
        <div className="multi-selector">

            <div className="controls">
                <div className="header">
                    <div className="flex-grow">
                        <EditableText
                            order={'h4'}
                            value={title}
                            label={(manifest.names?.singular ?? dataKey) + " section title"}
                            placeholder={"Enter a title"}
                            onUpdate={setTitle}
                        />
                    </div>
                    {onRemove &&
                        <ActionIcon
                            onClick={() => {
                                onRemove();
                            }}
                            icon={<X/>}
                            color={"danger"}
                            tooltip={"Delete this section"}
                        />
                    }
                    <ActionIcon
                        icon={<SettingsIcon/>}
                        onClick={() => setControlsOpen(!controlsOpen)}
                        tooltip={controlsOpen ? "Hide controls" : "Show controls"}
                    />
                </div>
                <div className={"selector " + (controlsOpen ? " open" : " closed")}>
                    {controlsOpen && (
                        <Drawer>
                            <div className={'buttons'}>
                                <ActionIcon
                                    onClick={() => setIsAdding(true)}
                                    icon={<Plus/>}
                                    size={'sm'}
                                    tooltip={"Create a new " + (manifest.names?.singular ?? dataKey)}>
                                </ActionIcon>
                                <ActionIcon
                                    onClick={() => {
                                        onSelect(isDynamic ? {} : []);
                                        setSelectedItems([]);
                                        setQuery({})
                                    }}
                                    icon={<Undo/>}
                                    color={"info"}
                                    size={'sm'}
                                    tooltip={"Reset filters"}>
                                </ActionIcon>
                                <BinaryToggle
                                    state={isDynamic}
                                    onToggle={setIsDynamic}
                                    label={["Direct select", "Query"]}
                                    size={"sm"}
                                    elements={[
                                        <ListPlus key={1}/>,
                                        <Database key={2}/>
                                    ]}
                                />
                            </div>

                            {isDynamic && (
                                <DataQueryEditor
                                    query={query}
                                    onSave={setQuery}
                                    queryFields={queryFields}
                                    showEditToggle={true}
                                    defaultOpen={false}
                                />
                            )}

                            {/* Different content based on mode and state */}
                            {!isDynamic ? (
                                <ul role="listbox" className="divider">
                                    <AnimatePresence>
                                        {list.map((option: T) => (
                                            <PopInOut key={option._id} layout={false}>
                                                <ItemOption
                                                    item={option}
                                                    onSelect={() => toggleItem(option)}
                                                    onEdit={updateItem}
                                                    isSelected={isSelected(option)}
                                                    onDelete={deleteItem}
                                                    Renderer={PreviewComponent}
                                                    Form={EditComponent}
                                                    openEditInModal={openEditInModal}
                                                />
                                            </PopInOut>
                                        ))}
                                    </AnimatePresence>
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
                        </Drawer>
                    )}
                </div>
                <div className='connector'><MoveDown height={'1rem'}/></div>

            </div>
            <div aria-label={label} aria-haspopup="listbox" className="content">
                {(isDynamic ? list.length === 0 : selectedItems.length === 0) && (
                    <div className="item-selector-placeholder">
                        No {manifest.names?.plural ?? "items"} selected. Click settings to add new items or edit the
                        query.
                    </div>
                )}

                <ul
                    role="items"
                    className="selected-items"
                    aria-label="Selected Items"
                >
                    <AnimatePresence>
                        {(isDynamic ? list : selectedItems).map((option) => (
                            <PopInOut key={option._id}>
                                <ItemOption
                                    item={option}
                                    onSelect={!isDynamic ? () => toggleItem(option) : undefined}
                                    onEdit={updateItem}
                                    onDelete={deleteItem}
                                    Renderer={PreviewComponent}
                                    Form={EditComponent}
                                    openEditInModal={openEditInModal}
                                />
                            </PopInOut>
                        ))}
                    </AnimatePresence>
                </ul>
            </div>
            <AlertMessage error={error} warning={warning}/>
        </div>
    );
}
)

export default MultiSelectFromDB;