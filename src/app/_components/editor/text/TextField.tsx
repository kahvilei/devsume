// @/app/_components/editor/common/TextField.tsx
import React from 'react';
import Tooltip, {TooltipPosition} from "@/app/_components/common/Tooltip";
import {ContentVariant,Size} from "@/types/designTypes";



export interface TextFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    variant?: ContentVariant;
    size?: Size;
    showTooltip?: boolean;
    tooltipPosition?: TooltipPosition;
    disabled?: boolean;
    className?: string;
    id?: string;
    maxLength?: number;
    pattern?: string;
}

/**
 * TextField component - A styled text input with tooltip support
 *
 * Provides a consistent interface for text inputs with validation.
 */
const TextField: React.FC<TextFieldProps> =
    ({
         label,
         value,
         onChange,
         placeholder = "Enter text",
         size = "md",
         showTooltip = true,
         tooltipPosition = "left",
         disabled = false,
         className = "",
         id,
         maxLength,
         pattern
     }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!disabled) {
                onChange(e.target.value);
            }
        };

        const textContent = (
            <div className={`text-field ${size} ${className}`}>
                <input
                    id={id}
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    aria-label={label}
                    className={`input ${size}`}
                    disabled={disabled}
                    maxLength={maxLength}
                    pattern={pattern}
                />
            </div>
        );

        if (showTooltip && label) {
            return (
                <Tooltip text={label} position={tooltipPosition}>
                    {textContent}
                </Tooltip>
            );
        }

        return textContent;
    };

export default TextField;