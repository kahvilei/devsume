import React, {useState, useRef} from "react";
import ItemEdit from "@/app/_components/editors/items/ItemEdit";
import Modal from "@/app/_components/layouts/Modal";
import PortalOverlay from "@/app/_components/layouts/PortalOverlay";
import ActionIcon from "@/app/_components/buttons/ActionIcon";
import {PreviewProps} from "@/interfaces/data";
import {IBaseItem} from "@/server/models/schemas/IBaseItem";
import {Item} from "@/app/_data/Items/Item";
import {observer} from "mobx-react-lite";
import {Pencil, Trash2} from "lucide-react"; // Adjust icon imports based on your icon library

interface ItemOptionProps<T extends IBaseItem> {
    item: Item<T>;
    onClick?: (item: Item<T>) => void;
}

export const ItemPreview = observer(<T extends IBaseItem>(
    {
        item,
        onClick = () => {},
    }: ItemOptionProps<T>) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const itemRef = useRef<HTMLDivElement>(null);

    // Default renderer component
    const DefaultRenderer: React.FC<PreviewProps<T>> = ({item}) => <>{item.getData().title}</>;

    // Use provided Renderer or default
    const ItemRenderer = item.preview || DefaultRenderer;

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleDelete = () => {
            // You might want to add a confirmation dialog here
            item.delete().then(() => {})
    };

    return (
        <>
            <div ref={itemRef} className="item-preview-wrapper">
                <ItemRenderer
                    item={item}
                    onClick={() => {
                        onClick(item);
                    }}
                />
            </div>

            <PortalOverlay
                overlayKey={`item-actions-${item.getData()._id}`}
                targetRef={itemRef}
                hoverMode={true}
                hoverDelay={300}
                placement="top"
                className="content-style-2"
                minWidth="auto"
                minHeight="auto"
            >
                <div className="flex items-center gap-xs p-xs">
                    <ActionIcon
                        icon={<Pencil size={16} />}
                        onClick={handleEdit}
                        tooltip="Edit"
                        size="sm"
                        variant="btn-shadow-spread"
                        color="primary"
                    />
                    <ActionIcon
                        icon={<Trash2 size={16} />}
                        onClick={handleDelete}
                        tooltip="Delete"
                        size="sm"
                        variant="btn-shadow-spread"
                        color="danger"
                    />
                </div>
            </PortalOverlay>

            <Modal
                isOpen={isEditing}
                setIsOpen={setIsEditing}
            >
                <ItemEdit
                    label="Edit item"
                    item={item}
                    onCancel={() => setIsEditing(false)}
                />
            </Modal>
        </>
    );
});