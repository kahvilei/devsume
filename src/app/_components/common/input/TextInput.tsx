// @/app/_components/editor/common/TextInput.tsx
import React from 'react';
import Tooltip, {TooltipPosition} from "@/app/_components/common/layouts/Tooltip";
import {Size} from "@/types/designTypes";



export interface TextFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
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
 * TextInput component - A styled text input with tooltip support
 *
 * Provides a consistent interface for text inputs with validation.
 */
const TextInput: React.FC<TextFieldProps> =
    ({
         label,
         value,
         onChange,
         placeholder = "Enter text",
         size = "md",
         showTooltip = true,
         tooltipPosition = "above",
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
                <input
                    id={id}
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    aria-label={label}
                    disabled={disabled}
                    maxLength={maxLength}
                    pattern={pattern}
                />
        );

        if (showTooltip && label) {
            return (
                <div className={`text-input ${size} ${className}`} >
                    <Tooltip text={label} position={tooltipPosition}>
                        {textContent}
                    </Tooltip>
                </div>
            );
        }

        return textContent;
    };

export default TextInput;