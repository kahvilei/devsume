import React, {useEffect, useState} from "react";
import {AlertMessage} from "@/app/_components/common/AlertMessage";
import {useSelection} from "@/app/_hooks/common/useSelection";
import {useAPI} from "@/app/_hooks/common/useAPI";
import {BaseDataModel} from "@/interfaces/api";
import ItemOption from "@/app/_components/editor/items/ItemOption";
import ItemEdit from "@/app/_components/editor/items/ItemEdit";

interface MultiSelectProps<T extends BaseDataModel> {
    values?: T[]
    label: string
    placeholder: string
    apiUrl: string
    onSelect: (value: T[]) => void
}

export default function MultiSelect<T extends BaseDataModel>({values = [], label, placeholder="Add items", apiUrl, onSelect}: MultiSelectProps<T>) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const { list, error, warning, createItem, updateItem, deleteItem } = useAPI<T>(apiUrl);
    const {
        selectedItems,
        toggleItem,
        isSelected,
    } = useSelection<T>(values, list);

    useEffect(() => {
        onSelect(selectedItems);
    }, [selectedItems]);

    return (
        <div className={"multi-selector-wrap"}>
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
                    aria-label="Selected Items" >
                    {selectedItems.map((item) => (
                        <li
                            className="item-selector item" key={item._id}
                            onClick={() => toggleItem(item)}
                        >
                            {item.title}
                        </li>
                    ))}
                </ul>
                {selectedItems?.length===0&&<div onClick={() => setIsOpen(!isOpen)} className="item-selector-placeholder">{placeholder}</div>}
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
                            />
                        ))}
                        {isAdding ? (
                            <li className="p-2">
                                <ItemEdit
                                    label="Add a new item"
                                    onSave={createItem}
                                    onCancel={() => setIsAdding(false)}
                                />
                            </li>
                        ) : (
                            <li
                                className="item-selector item cursor-pointer text-blue-500"
                                onClick={() => {
                                    setIsAdding(true)
                                }
                                }
                            >
                                + Add new item
                            </li>
                        )}

                    </ul>
                )}
                <AlertMessage error={error} warning={warning}/>
            </div>
        </div>
    );
}