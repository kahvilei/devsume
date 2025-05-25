
import React, {useEffect, useState} from "react";
import {AlertMessage} from "@/app/_components/common/display/AlertMessage";
import {useSelection} from "@/app/_hooks/common/useSelection";
import ItemOption from "@/app/_components/common/editors/items/ItemOption";
import ItemEdit from "@/app/_components/common/editors/items/ItemEdit";
import Modal from "@/app/_components/common/layouts/Modal";
import {getConfig, ItemManifestList} from "@/config/items";
import EditableText from "@/app/_components/common/input/EditableText";
import BinaryToggle from "@/app/_components/common/buttons/BinaryToggle";
import {Database, ListPlus, MoveDown, Plus, SettingsIcon, Undo, X} from "lucide-react";
import {ActionIcon} from "@/app/_components/common/buttons/ActionIcon";
import {DataQueryEditor} from "@/app/_components/common/editors/DataQueryEditor";
import PopInOut from "@/app/_components/animations/PopInOut";
import {AnimatePresence} from "motion/react";
import Drawer from "../../animations/Drawer";
import {DataService} from "@/app/_data";
import {observer} from "mobx-react-lite"
import {Data, DataFilter, DataQuery} from "@/server/models/schemas/data";
import {IBaseItem} from "@/server/models/schemas/IBaseItem";
import {Item} from "@/app/_data/Items/Item";

interface MultiSelectProps<T extends IBaseItem> {
    values?: Data<T>;
    title: string;
    dataKey: string;
    onSelect: (value: Data<T>) => void;
    onUpdateTitle?: (title: string) => void;
    onRemove?: () => void;
}

export const MultiSelectFromDB = observer(<T extends IBaseItem>({
    values = [],
    title,
    dataKey,
    onSelect,
    onRemove,
    onUpdateTitle
}: MultiSelectProps<T>) =>
{
    const [controlsOpen, setControlsOpen] = useState<boolean>(false);
    const [isAdding, setIsAdding] = useState<boolean>(false);

    // Get the item manifest and its queryFields (if available)
    const manifest = getConfig(dataKey as keyof ItemManifestList);
    const {
        queryFields = {},
        preview: PreviewComponent,
        edit: EditComponent,
        openEditInModal = false
    } = manifest;

    // Determine if values is a Data object or an array
    const initialIsDynamic = !Array.isArray(values);
    const [isDynamic, setIsDynamic] = useState<boolean>(initialIsDynamic);

    // Initialize query from values if it's a Data, or create an empty one
    const initialQuery:
        DataQuery<T> = initialIsDynamic
        ? values as DataQuery<T>
        : {filter: {} as Record<keyof T, DataFilter>, sort: undefined, limit: undefined} as DataQuery<T>;

    const [query, setQuery] = useState<DataQuery<T>>(initialQuery);

    const service = DataService.getService(dataKey as keyof ItemManifestList);
    const api = manifest.api;
    const [list, setList] = useState<Item<T>[]>([]);
    useEffect(() => {
        service.getQueryResult(manifest.api, query).then(
            (results) => {
                setList((results?.content) as unknown as Item<T>[]);
            }
        );
    }, [manifest.api, query, service]);

    // Use the selection hook to manage selected items
    const {
        selectedItems,
        toggleItem,
        isSelected,
        setSelectedItems
    } = useSelection<Item<T>>(isDynamic ? list : (Array.isArray(values) ? values : []), list);


    const handleAddItemSave = async (item: T) => {
        await service.createItem(api, item);
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
                            onUpdate={onUpdateTitle??(()=>{})}
                        />
                    </div>
                    {onRemove &&
                        <ActionIcon
                            onClick={() => {
                                onRemove();
                            }}
                            icon={<X/>}
                            color={"danger"}
                            size={'sm'}
                            tooltip={"Delete this section"}
                        />
                    }
                    <ActionIcon
                        icon={<SettingsIcon/>}
                        onClick={() => setControlsOpen(!controlsOpen)}
                        size={'sm'}
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
                                        {list.map((option: Item<T>) => (
                                            <PopInOut key={option.getData()._id} layout={false}>
                                                <ItemOption
                                                    item={option.getData()}
                                                    onSelect={() => toggleItem(option)}
                                                    onEdit={(item) => service.updateItem(api, item)}
                                                    isSelected={isSelected(option)}
                                                    onDelete={(item) => service.deleteItem(api, item)}
                                                    Renderer={option.getPreviewComponent()}
                                                    Form={option.getEditComponent()}
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
                                        onSave={handleAddItemSave}
                                        onCancel={() => setIsAdding(false)}
                                    />
                                </Modal>
                            )}
                        </Drawer>
                    )}
                </div>
                <div className='connector'><MoveDown height={'1rem'}/></div>

            </div>
            <div aria-label={title} aria-haspopup="listbox" className="content">
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
                            <PopInOut key={option.getData()._id}>
                                <ItemOption
                                    item={option.getData()}
                                    onSelect={!isDynamic ? () => toggleItem(option) : undefined}
                                    onEdit={(item) => service.updateItem(api,item)}
                                    onDelete={(item) => service.deleteItem(api,item)}
                                    Renderer={option.getPreviewComponent()}
                                    Form={option.getEditComponent()}
                                    openEditInModal={openEditInModal}
                                />
                            </PopInOut>
                        ))}
                    </AnimatePresence>
                </ul>
            </div>
            <AlertMessage error={service.error} warning={service.warning}/>
        </div>
    );
}
)

export default MultiSelectFromDB;