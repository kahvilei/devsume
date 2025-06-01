import {PreviewProps} from "@/interfaces/data";
import React from "react";
import {ActionIcon} from "@/app/_components/buttons/ActionIcon";
import {Pencil, Trash} from "lucide-react";
import {Avatar} from "@/app/_components/display/Avatar";
import {ICollaborator} from "@/custom/categories/collaborator/model";

export default function PreviewCollaborator(
    {
        item,
        onClick = () => {
            window.location.href = `/tags/${item.getData().slug}`
        },
        size = "md",
        className = 'content-style-1',
        disabled = false,
        setIsEditing,
        showEdit = false,
    }: PreviewProps<ICollaborator>) {
    const collaborator = item.getData();
    return (
        <div
            tabIndex={0}
            className={`${size} ${className} ${disabled ? 'disabled' : ''} flex flex-row gap-sm items-center`}
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
            <Avatar name={collaborator.title} src={collaborator.img?.url}/>
            <div className="flex flex-col gap-xxs">
                <span className="tag-label font-bold">{collaborator.title}</span>
                <span className="tag-label">{collaborator.description}</span>
            </div>
            <span className={"flex gap-xxs"}>
                {showEdit && setIsEditing &&
                    <ActionIcon
                        onClick={() => setIsEditing(true)}
                        icon={<Pencil/>}
                        tooltip={"Edit collaborator"}
                        size="xs"
                        variant="btn-light"
                        color="foreground"
                        radius="rounded-full"
                    />
                }
                {showEdit && item.delete &&
                    <ActionIcon
                    onClick={() => item.delete()}
                    icon={<Trash/>}
                    tooltip="Delete collaborator"
                    size="xs"
                    variant="btn-light"
                    color="foreground"
                    radius="rounded-full"
                />
                }

            </span>
        </div>
    );
}
