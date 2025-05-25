import React, {useState} from "react";
import ItemEdit from "@/app/_components/common/editors/items/ItemEdit";
import Modal from "@/app/_components/common/layouts/Modal";
import {EditProps, PreviewProps} from "@/interfaces/data";
import {IBaseItem} from "@/server/models/schemas/IBaseItem";

interface ItemOptionProps<T extends IBaseItem> {
    item: T;
    isSelected?: boolean;
    onSelect?: (item: T) => void;
    onDelete?: (item: T) => void;
    onEdit?: (item: T) => void;
    Renderer?: React.FC<PreviewProps<T>>;
    Form?: React.FC<EditProps<T>>;
    openEditInModal?: boolean;
}

export default function ItemOption<T extends IBaseItem>(
    {
        item,
        isSelected,
        onSelect = () => {
        },
        onDelete = () => {
        },
        onEdit = () => {
        },
        Renderer,
        Form,
        openEditInModal = false,
    }: ItemOptionProps<T>) {
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const handleEdit = (updatedItem: T) => {
        onEdit(updatedItem);
        setIsEditing(false);
    };

    // Default renderer component
    const DefaultRenderer: React.FC<PreviewProps<T>> = ({item}) => <>{item.title}</>;

    // Use provided Renderer or default
    const ItemRenderer = Renderer || DefaultRenderer;

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
            {!isEditing && (
                <ItemRenderer
                    item={item}
                    onDelete={onDelete}
                    setIsEditing={setIsEditing}
                    onClick={() => {
                        onSelect(item);
                    }}
                />
            )}

            {/* Render edit form */}
            {isEditing && (
                <div onClick={(e) => e.stopPropagation()}>
                    {openEditInModal ? (
                        <Modal
                            isOpen={isEditing}
                            onClose={() => setIsEditing(false)}
                            title={`Edit ${item.title}`}
                        >
                            <ItemEdit
                                label="Edit item"
                                item={item}
                                onSave={handleEdit}
                                onCancel={() => setIsEditing(false)}
                                Form={Form}
                            />
                        </Modal>
                    ) : (
                        <ItemEdit
                            label="Edit item"
                            item={item}
                            onSave={handleEdit}
                            onCancel={() => setIsEditing(false)}
                            Form={Form}
                        />
                    )}
                </div>
            )}
        </li>
    );
}