import React from 'react';
import Tooltip from "@/app/_components/layouts/Tooltip";
import {TextInputProps} from "@/interfaces/components/input";

/**
 * TextInput component - A styled text components with tooltip support
 *
 * Provides a consistent interface for text inputs with validation.
 */
const TextInput: React.FC<TextInputProps> =
    ({
         label,
         value,
         onChange,
         placeholder = "Enter text",
         size = "md",
         showTooltip = true,
         tooltipPosition = "above",
         disabled = false,
         required = false,
         className = "",
         id,
         maxLength,
         pattern
     }) => {
        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (!disabled) {
                onChange(e.target.value);
            }
        };

        const textContent = (
            <textarea
                id={id}
                value={value}
                onChange={(e) => handleChange(e)}
                placeholder={placeholder}
                aria-label={label}
                disabled={disabled}
                maxLength={maxLength}
                required={required}
            />
        );

        if (showTooltip && label) {
            return (
                <div className={`text-input ${size} ${className}`}>
                    <Tooltip text={label} position={tooltipPosition}>
                        {textContent}
                    </Tooltip>
                </div>
            );
        }

        return textContent;
    };

export default TextInput;