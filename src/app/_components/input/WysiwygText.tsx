import React from 'react';
import Tooltip, {TooltipPosition} from "@/app/_components/layouts/Tooltip";
import {ContentVariant} from "@/types/designTypes";

interface EditableTextProps {
    order?: string
    value?: string
    label: string
    placeholder: string
    onUpdate: (value: string) => void
    required?: boolean
    showTooltip?: boolean
    toolTipPosition?: TooltipPosition
    variant?: ContentVariant
}

export default function WysiwygText(
    {
        order = "body",
        value = '',
        label,
        placeholder = "Enter text",
        onUpdate,
        required,
        showTooltip = true,
        toolTipPosition = "above",
        variant = "content-style-1"
    }: EditableTextProps) {
    const content = (
        <div className="editable-text">
            <div className="editable-text-error"></div>
            <div className="editable-text-warning"></div>
            <div aria-hidden className={`${order} ${variant} text proxy`}>
                {(value === "") ? placeholder : value}
            </div>
            <textarea
                value={value}
                placeholder={placeholder}
                onChange={(event) => onUpdate(event.currentTarget.value.replace(/[\r\n\v]+/g, ''))}
                aria-label={label}
                className={`${order} ${variant} text`}
                required={required}
            />
        </div>
    );

    // Apply tooltip to the entire component if showTooltip is true
    if (showTooltip && label) {
        return (
            <Tooltip text={label} position={toolTipPosition}>
                {content}
            </Tooltip>
        );
    }

    return content;
}