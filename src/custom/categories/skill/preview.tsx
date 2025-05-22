import {ISkill} from "@/custom/categories/skill/model";
import {PreviewProps} from "@/interfaces/data";
import React from "react";
import {ActionIcon} from "@/app/_components/common/ActionIcon";
import {Pencil, Trash} from "lucide-react";

export default function PreviewSkill(
    {
        item: tag,
        onClick = () => {
            window.location.href = `/tags/${tag.slug}`
        },
        size = "md",
        className = 'rounded-full primary btn-shadow-filled',
        disabled = false,
        onDelete,
        setIsEditing,
    }: PreviewProps<ISkill>) {
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
            <span className="tag-label">{tag.title}</span>
            <span className={"flex gap-xxs"}>
            {setIsEditing &&
                <ActionIcon
                    onClick={() => setIsEditing(true)}
                    icon={<Pencil/>}
                    tooltip={"Edit tag"}
                    size="xs"
                    variant="btn-light"
                    color="background"
                    radius="rounded-full"
                />
            }
            {onDelete &&
                <ActionIcon
                    onClick={() => onDelete(tag)}
                    icon={<Trash/>}
                    tooltip="Delete tag"
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
