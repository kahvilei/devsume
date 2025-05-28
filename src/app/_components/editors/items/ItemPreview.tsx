import React, {useState} from "react";
import ItemEdit from "@/app/_components/editors/items/ItemEdit";
import Modal from "@/app/_components/layouts/Modal";
import {PreviewProps} from "@/interfaces/data";
import {IBaseItem} from "@/server/models/schemas/IBaseItem";
import {Item} from "@/app/_data/Items/Item";
import {observer} from "mobx-react-lite";

interface ItemOptionProps<T extends IBaseItem> {
    item: Item<T>;
    onClick?: (item: Item<T>) => void;
    openEditInModal?: boolean;
}

export const ItemPreview = observer(<T extends IBaseItem>(
    {
        item,
        onClick = () => {
        },
    }: ItemOptionProps<T>) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);


    // Default renderer component
    const DefaultRenderer: React.FC<PreviewProps<T>> = ({item}) => <>{item.getData().title}</>;

    // Use provided Renderer or default
    const ItemRenderer = item.preview || DefaultRenderer;
    const openEditInModal = true;

    return (
        <>
            <ItemRenderer
                item={item}
                setIsEditing={setIsEditing}
                onClick={() => {
                    onClick(item);
                }}
            />


            {/* Render edit form */}
            {isEditing && (
                <div onClick={(e) => e.stopPropagation()}>
                    {openEditInModal ? (
                        <Modal
                            isOpen={isEditing}
                            onClose={() => setIsEditing(false)}
                            title={`Edit ${item.getData().title}`}
                        >
                            <ItemEdit
                                label="Edit item"
                                item={item}
                                onCancel={() => setIsEditing(false)}
                            />
                        </Modal>
                    ) : (
                        <ItemEdit
                            label="Edit item"
                            item={item}
                            onCancel={() => setIsEditing(false)}
                        />
                    )}
                </div>
            )}
        </>
    );
});