import React, {useEffect, useState} from "react";
import {AlertMessage} from "@/app/_components/display/AlertMessage";
import ItemEdit from "@/app/_components/editors/items/ItemEdit";
import Modal from "@/app/_components/layouts/Modal";
import {ItemManifestList} from "@/config/items";
import BinaryToggle from "@/app/_components/buttons/BinaryToggle";
import {Database, ListPlus, MoveDown, SettingsIcon, Undo} from "lucide-react";
import {ActionIcon} from "@/app/_components/buttons/ActionIcon";
import {DataQueryEditor} from "@/app/_components/editors/DataQueryEditor";
import {DataService} from "@/app/_data";
import {observer} from "mobx-react-lite"
import {Data, DataFilter, DataQuery} from "@/server/models/schemas/data";
import {IBaseItem} from "@/server/models/schemas/IBaseItem";
import {Item} from "@/app/_data/Items/Item";
import {ItemMultipleSelect} from "@/app/_components/editors/items/ItemSelectList";
import {ItemList} from "@/app/_components/editors/items/ItemList";

interface ItemSelectProps<T extends IBaseItem> {
    values?: Data<T>;
    label?: string;
    dataKey: string;
    onSelect: (value: Data<T>) => void;
}

export const ItemSelectFromDB = observer(<T extends IBaseItem>(
        {
            values = [],
            label = "Select items",
            dataKey,
            onSelect,
        }: ItemSelectProps<T>) => {
    
        const [controlsOpen, setControlsOpen] = useState<boolean>(false);
        const [isAdding, setIsAdding] = useState<boolean>(false);
        const [selectedItems, setSelectedItems] = useState<Item<T>[]>([]);
        
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
        const [list, setList] = useState<Item<T>[]>([]);

        if (!isDynamic) {
            setSelectedItems(values as unknown as Item<T>[]);
        }
        
        useEffect(() => {
            service.getQueryResult(query, dataKey).then(
                (results) => {
                    setList((results?.content) as unknown as Item<T>[]);
                }
            );
        }, [dataKey, query, service]);

        useEffect(() => {
            onSelect(isDynamic ? query : selectedItems.map(item => item.getData()));
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isDynamic, query, selectedItems]);

        return (
            <div className="multi-selector">

                <div className="controls">
                    <div className="header">
                        <ActionIcon
                            icon={<SettingsIcon/>}
                            onClick={() => setControlsOpen(!controlsOpen)}
                            size={'sm'}
                            tooltip={controlsOpen ? "Hide controls" : "Show controls"}
                        />
                    </div>
                    <div className={"selector " + (controlsOpen ? " open" : " closed")}>
                        {controlsOpen && (
                            <div>
                                <div className={'buttons'}>
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
                                        queryFields={service.getQueryFields(dataKey)}
                                        showEditToggle={true}
                                        defaultOpen={false}
                                    />
                                )}

                                {/* Different content based on mode and state */}
                                {!isDynamic ? (
                                    <ItemMultipleSelect items={list} selected={selectedItems} onSelect={setSelectedItems}/>
                                ) : null}

                                {/* Add new item section */}
                                {isAdding && (
                                    <Modal
                                        isOpen={isAdding}
                                        onClose={() => setIsAdding(false)}
                                        title={"Create a new " + (service.getSingularName(dataKey) ?? dataKey)}
                                    >
                                        <ItemEdit
                                            item={new Item({title:""}, dataKey)}
                                            label="Add a new item"
                                            onCancel={() => setIsAdding(false)}
                                        />
                                    </Modal>
                                )}
                            </div>
                        )}
                    </div>
                    <div className='connector'><MoveDown height={'1rem'}/></div>

                </div>
                <div aria-label={label} aria-haspopup="listbox" className="content">
                    {(isDynamic ? list.length === 0 : selectedItems.length === 0) && (
                        <div className="item-selector-placeholder">
                            No {service.getPluralName(dataKey) ?? "items"} selected. Click settings to add new items or edit the
                            query.
                        </div>
                    )}
                   <ItemList items={selectedItems}/>
                </div>
                <AlertMessage error={service.error} warning={service.warning}/>
            </div>
        );
    }
)

export default ItemSelectFromDB;