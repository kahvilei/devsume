import {PreviewProps} from "@/interfaces/data";
import React from "react";
import {ActionIcon} from "@/app/_components/buttons/ActionIcon";
import {Pencil, Trash} from "lucide-react";
import {ICategory} from "@/server/models/Category";

export default function PreviewCategory(
    {
        item: category,
        onClick = () => {
            window.location.href = `/categories/${category.slug}`
        },
        size = "md",
        className = 'rounded-full primary btn-shadow-filled',
        disabled = false,
        onDelete,
        setIsEditing,
    }: PreviewProps<ICategory>) {
    return (

        <div
            role="button"
            tabIndex={0}
            className={`tag ${size} ${className} ${disabled ? 'disabled' : ''}`}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
                e.stopPropagation();
            }}
        >
            <span className="tag-label">{category.title}</span>
            <span className={"flex gap-xxs"}>
            {setIsEditing &&
                <ActionIcon
                    onClick={() => setIsEditing(true)}
                    icon={<Pencil/>}
                    tooltip={"Edit categories"}
                    size="xs"
                    variant="btn-light"
                    color="background"
                    radius="rounded-full"
                />
            }
                {onDelete &&
                    <ActionIcon
                        onClick={() => onDelete(category)}
                        icon={<Trash/>}
                        tooltip="Delete category permanently"
                        size="xs"
                        variant="btn-light"
                        color="background"
                        radius="rounded-full"
                    />
                }
            </span>
        </div>
    );
}
