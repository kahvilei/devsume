import React, {useEffect, useState} from "react";
import {AlertMessage} from "@/app/_components/common/AlertMessage";
import {useSelection} from "@/app/_hooks/common/useSelection";
import {useAPI} from "@/app/_hooks/common/useAPI";
import ItemOption from "@/app/_components/editor/items/ItemOption";
import ItemEdit from "@/app/_components/editor/items/ItemEdit";
import Modal from "@/app/_components/common/Modal";
import ITEMS, {ItemManifest, ItemManifestList} from "@/config/itemManifest";
import {BaseDataModel, EditProps, PreviewProps} from "@/interfaces/data";

interface MultiSelectProps<T extends BaseDataModel> {
    values?: T[];
    label: string;
    placeholder?: string;
    dataKey: keyof ItemManifestList;
    onSelect: (value: T[]) => void;
}

export default function MultiSelectFromDB<T extends BaseDataModel>({
                                                                       values = [],
                                                                       label,
                                                                       placeholder = "Add items",
                                                                       dataKey,
                                                                       onSelect
                                                                   }: MultiSelectProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Cast the manifest to the correct type
    const manifest = ITEMS[dataKey] as ItemManifest<T>;
    const { list, error, warning, createItem, updateItem, deleteItem } = useAPI<T>(manifest.api);

    const {
        selectedItems,
        toggleItem,
        isSelected,
    } = useSelection<T>(values, list);

    useEffect(() => {
        onSelect(selectedItems);
    }, [selectedItems]);

    // Type assertions for the preview and edit components
    const PreviewComponent = manifest.preview as React.FC<PreviewProps<T>> | undefined;
    const EditComponent = manifest.edit as React.FC<EditProps<T>> | undefined;
    const openEditInModal = manifest.openEditInModal || false;

    const handleAddItemSave = (item: T) => {
        createItem(item);
        setIsAdding(false);
    };

    return (
        <div className="multi-selector-wrap">
            <div
                aria-label={label}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className="item-selector-button w-full cursor-pointer"
            >
                <ul
                    role="items"
                    onClick={() => setIsOpen(!isOpen)}
                    className="item-selector-items flex gap-2"
                    aria-label="Selected Items"
                >
                    {selectedItems.map((item) => (
                        <li
                            className="item-selector item"
                            key={item._id}
                            onClick={() => toggleItem(item)}
                        >
                            {item.title}
                        </li>
                    ))}
                </ul>

                {selectedItems.length === 0 && (
                    <div
                        onClick={() => setIsOpen(!isOpen)}
                        className="item-selector-placeholder"
                    >
                        {placeholder}
                    </div>
                )}

                {isOpen && (
                    <ul role="listbox">
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
                            <li className="p-2">
                                <ItemEdit
                                    label="Add a new item"
                                    Form={EditComponent}
                                    onSave={handleAddItemSave}
                                    onCancel={() => setIsAdding(false)}
                                />
                            </li>
                        ) : (
                            <li
                                className="item-selector item cursor-pointer text-blue-500"
                                onClick={() => setIsAdding(true)}
                            >
                                + Add new item
                            </li>
                        )}
                    </ul>
                )}

                <AlertMessage error={error} warning={warning} />
            </div>
        </div>
    );
}