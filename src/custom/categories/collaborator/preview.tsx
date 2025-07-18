import {PreviewProps} from "@/interfaces/data";
import React from "react";
import {Avatar} from "@/app/_components/display/Avatar";
import {ICollaborator} from "@/custom/categories/collaborator/model";

export default function PreviewCollaborator(
    {
        item,
        onClick = () => {
            window.location.href = `/tags/${item.getData().slug}`
        },
        className = 'content-style-1',
        disabled = false,
    }: PreviewProps<ICollaborator>) {
    const collaborator = item.getData();
    return (
        <div
            tabIndex={0}
            className={`${className} ${disabled ? 'disabled' : ''} flex flex-row gap-sm items-center`}
            onClick={() => {
                onClick();
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            }}
        >
            <Avatar name={collaborator.title} src={collaborator.img?.url}/>
            <div className="flex flex-col gap-xxs">
                <span className="tag-label font-bold">{collaborator.title}</span>
                <span className="tag-label">{collaborator.description}</span>
            </div>
        </div>
    );
}
