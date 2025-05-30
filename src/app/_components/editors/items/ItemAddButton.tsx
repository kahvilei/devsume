import Modal from "@/app/_components/layouts/Modal";
import ItemEdit from "@/app/_components/editors/items/ItemEdit";
import {Item} from "@/app/_data/Items/Item";
import React, {useState} from "react";
import {DataService} from "@/app/_data";
import ActionIcon from "@/app/_components/buttons/ActionIcon";
import {ButtonVariant, ColorVariant, SizeVariant} from "@/types/designTypes";
import {PlusIcon, X} from "lucide-react";

interface ItemAddButtonProps {
    type: string;
    size?: SizeVariant;
    color?: ColorVariant;
    variant?: ButtonVariant;
    disabled?: boolean;
}

export const ItemAddButton = (
    {
        type,
        size = "sm",
        color = "foreground",
        variant = "btn-shadow-filled",
        disabled = false,
    }: ItemAddButtonProps,
) => {
    const [isAdding, setIsAdding] = useState(false);
    const service = DataService.getService(type);
    const singularName = service.getSingularName(type);
    const icon = service.getIcon(type);
    return (
        <>
            <ActionIcon
                icon={icon}
                tooltip={`Create a new ${singularName}`}
                size={size}
                onClick={() => setIsAdding(true)}
                ariaLabel={`Create a new ${singularName}`}
                disabled={disabled}
                color={color}
                variant={variant}
            />
            <Modal
                isOpen={isAdding}
                setIsOpen={setIsAdding}
            >
                <ItemEdit
                    item={new Item({ title: "" }, type)}
                    label="Add a new item"
                    onCancel={() => setIsAdding(false)}
                />
            </Modal>
        </>
    );
}

export const ItemAddAnyOfTypeButton = (
    {
        type,
        size = "sm",
        color = "primary",
        disabled = false,
    }: ItemAddButtonProps,
) => {
    const service = DataService.getService(type);
    const types = service.getKeysOfType(type);
    const hasMultipleTypes = types.length > 1;
    const [optionsOpen, setOptionsOpen] = useState(false);

    return (
        <>
            { hasMultipleTypes ? (
                <>
                    <ActionIcon
                        icon={optionsOpen?<X/>:<PlusIcon/>}
                        tooltip={`Create a new ${service.getSingularName(type)}`}
                        color={color}
                        size={size}
                        disabled={disabled}
                        onClick={() => setOptionsOpen(!optionsOpen)}
                    />
                    { optionsOpen && (
                        types.map(typeKey => (
                            <ItemAddButton
                                type={typeKey}
                                size={size}
                                color={color}
                                disabled={disabled}
                                key={typeKey}
                            />
                        ))
                    )}
                </>
                )
                : (
                    <ItemAddButton
                        type={type}
                        size={size}
                        color={color}
                        disabled={disabled}
                    />
                )
            }
        </>
    );
}