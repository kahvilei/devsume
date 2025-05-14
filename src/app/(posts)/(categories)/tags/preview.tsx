import {ITag} from "@/models/categories/Tag";
import {PreviewProps} from "@/interfaces/data";
import React from "react";
import {ActionIcon} from "@/app/_components/common/ActionIcon";
import {Pencil, Trash} from "lucide-react";

export default function PreviewTag(
    {
        item: tag,
        onClick = () => {
            window.location.href = `/tags/${tag.slug}`
        },
        size = "md",
        className = '',
        disabled = false,
        onDelete,
        setIsEditing,
    }: PreviewProps<ITag>) {
    return (

        <div
            role="button"
            tabIndex={0}
            className={`tag bg-primary ${size} ${className} ${disabled ? 'disabled' : ''}`}
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
            {setIsEditing &&
                <ActionIcon
                    action={() => setIsEditing(true)}
                    icon={<Pencil/>}
                    tooltip={"Edit tag"}
                    size="xs"
                    variant="subtle"
                    color="background"
                    radius="rounded-full"
                />
            }
            {onDelete &&
                <ActionIcon
                    action={() => onDelete(tag)}
                    icon={<Trash/>}
                    tooltip="Delete tag"
                    size="xs"
                    variant="subtle"
                    color="background"
                    radius="rounded-full"
                />
            }
        </div>
    );
}
