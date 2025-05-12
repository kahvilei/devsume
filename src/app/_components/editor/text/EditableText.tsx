import React from 'react';
import Tooltip, {TooltipPosition} from "@/app/_components/common/Tooltip";

type ClarityVariant = "ghost" | "subtle" | "default" | "emphasis" | "prominent";

interface EditableTextProps {
    order?: string
    value?: string
    label: string
    placeholder: string
    onUpdate: (value: string) => void
    required?: boolean
    showTooltip?: boolean
    toolTipPosition?: TooltipPosition
    variant?: ClarityVariant
}

export default function EditableText(
    {
        order = "body",
        value = '',
        label,
        placeholder = "Enter text",
        onUpdate,
        required,
        showTooltip = true,
        toolTipPosition = "left",
        variant = "ghost"
    }: EditableTextProps) {
    const content = (
        <div className="editable-text-wrap">
            <div className="editable-text-error"></div>
            <div className="editable-text-warning"></div>
            <div aria-hidden className={`${order} text proxy`}>
                {(value === "") ? placeholder : value}
            </div>
            <textarea
                value={value}
                placeholder={placeholder}
                onChange={(event) => onUpdate(event.currentTarget.value.replace(/[\r\n\v]+/g, ''))}
                aria-label={label}
                className={`${order} clarity-${variant} text`}
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