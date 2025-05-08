import {useState} from "react";
import ItemEdit from "@/app/_components/editor/items/ItemEdit";
import {BaseDataModel} from "@/interfaces/api";

interface ItemOptionProps<T extends BaseDataModel> {
    item: T;
    isSelected?: boolean;
    onSelect?: (item: T) => void;
    onDelete?: (item: T) => void;
    onEdit?: (item: T) => void;
}

export default function ItemOption<T extends BaseDataModel>({
                                                                item,
                                                                isSelected,
                                                                onSelect = () => {},
                                                                onDelete = () => {},
                                                                onEdit = () => {},
                                                            }: ItemOptionProps<T>) {

    const [isEditing, setIsEditing] = useState<boolean>(false);

    const handleEdit = (updatedItem: T) => {
        onEdit(updatedItem);
        setIsEditing(false);
    };

    return (
        <li
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onSelect(item);
            }}
            key={item._id}
            role="option"
            aria-label={item.title}
            className="flex items-center justify-between item-selector item cursor-pointer"
            aria-selected={isSelected}
        >
            <div className="flex items-center">
                <span className="mr-2">{item.title}</span>
                {isSelected && <span className="text-xs text-gray-500">Selected</span>}
            </div>
            <div className="flex items-center">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                    }}
                    className="mr-2"
                >
                    Edit
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item);
                    }}
                >
                    Delete
                </button>
            </div>
            {isEditing &&
                <ItemEdit
                    label="Edit item"
                    value={item}
                    onSave={handleEdit}
                    onCancel={() => setIsEditing(false)}
                />
            }
        </li>
    );
}