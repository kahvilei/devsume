// @/app/_components/editor/common/NumberInput.tsx
import React from 'react';
import Tooltip from "@/app/_components/layouts/Tooltip";
import {Hash} from "lucide-react";
import {NumberInputProps} from "@/interfaces/components/input";

/**
 * NumberInput component - A styled number components with icon and tooltip support
 *
 * Provides a consistent interface for number inputs with validation.
 */
const NumberInput: React.FC<NumberInputProps> =
    ({
         label,
         value,
         onChange,
         placeholder = "Enter number",
         size = "md",
         min,
         max,
         step = 1,
         showTooltip = true,
         tooltipPosition = "above",
         disabled = false,
        required = false,
         className = "",
         id
     }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!disabled) {
                onChange(parseInt(e.target.value)??0);
            }
        };

        const numberContent = (
            <div className="select-trigger">
                <Hash size={16} className="select-icon"/>
                <input
                    id={id}
                    type="number"
                    value={value}
                    onChange={handleChange}
                    min={min}
                    max={max}
                    step={step}
                    placeholder={placeholder}
                    className={`${size}`}
                    disabled={disabled}
                    required={required}
                    aria-label={label}
                />
            </div>
        );

        if (showTooltip && label) {
            return (
                <div className={`number-select ${size} ${className}`}>
                    <Tooltip text={label} position={tooltipPosition}>
                        {numberContent}
                    </Tooltip>
                </div>
            );
        }

        return numberContent;
    };

export default NumberInput;