// @/app/_components/editor/common/NumberInput.tsx
import React from 'react';
import Tooltip, {TooltipPosition} from "@/app/_components/layouts/Tooltip";
import {Hash} from "lucide-react";
import {Size} from "@/types/designTypes";

export interface NumberFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    size?: Size;
    min?: number;
    max?: number;
    step?: number;
    showTooltip?: boolean;
    tooltipPosition?: TooltipPosition;
    disabled?: boolean;
    className?: string;
    id?: string;
}

/**
 * NumberInput component - A styled number input with icon and tooltip support
 *
 * Provides a consistent interface for number inputs with validation.
 */
const NumberInput: React.FC<NumberFieldProps> =
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
         className = "",
         id
     }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!disabled) {
                onChange(e.target.value);
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