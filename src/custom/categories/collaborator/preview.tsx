import {ISkill} from "@/custom/categories/skill/model";
import {PreviewProps} from "@/interfaces/data";
import React from "react";
import {ActionIcon} from "@/app/_components/buttons/ActionIcon";
import {Pencil, Trash} from "lucide-react";

export default function PreviewCollaborator(
    {
        item,
        onClick = () => {
            window.location.href = `/tags/${item.getData().slug}`
        },
        size = "md",
        className = 'rounded-full secondary btn-shadow-filled',
        disabled = false,
        setIsEditing,
    }: PreviewProps<ISkill>) {
    const collaborator = item.getData();
    return (
        <div
            role="button"
            tabIndex={0}
            className={`pill ${size} ${className} ${disabled ? 'disabled' : ''}`}
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
            <span className="tag-label">{collaborator.title}</span>
            <span className="tag-label">{collaborator.description}</span>
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
            {item.delete &&
                <ActionIcon
                    onClick={() => item.delete()}
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
