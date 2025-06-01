import {ISkill} from "@/custom/categories/skill/model";
import {PreviewProps} from "@/interfaces/data";
import React from "react";

export default function PreviewSkill(
    {
        item,
        onClick = () => {
            window.location.href = `/tags/${item.getData().slug}`
        },
        className = 'rounded-full primary btn-shadow-filled',
        disabled = false,
    }: PreviewProps<ISkill>) {
    const tag = item.getData();
    return (
        <div
            role="button"
            tabIndex={0}
            className={`tag ${className} ${disabled ? 'no-hover' : ''}`}
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
        </div>
    );
}
