import React, {useState} from "react";
import ItemEdit from "@/app/_components/editor/items/ItemEdit";
import Modal from "@/app/_components/common/Modal";
import {BaseDataModel, EditProps, PreviewProps} from "@/interfaces/data";

interface ItemOptionProps<T extends BaseDataModel> {
    item: T;
    isSelected?: boolean;
    onSelect?: (item: T) => void;
    onDelete?: (item: T) => void;
    onEdit?: (item: T) => void;
    Renderer?: React.FC<PreviewProps<T>>;
    Form?: React.FC<EditProps<T>>;
    openEditInModal?: boolean;
}

export default function ItemOption<T extends BaseDataModel>(
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