// @/app/_components/editor/common/DateInput.tsx
import React from 'react';
import Tooltip, {TooltipPosition} from "@/app/_components/layouts/Tooltip";
import {Calendar} from "lucide-react";
import {ContentVariant, Size} from "@/types/designTypes";


export interface DateFieldProps {
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
    min?: string; // ISO date string for min date
    max?: string; // ISO date string for max date
}

/**
 * DateInput component - A styled date input with icon and tooltip support
 *
 * Provides a consistent interface for date inputs with validation.
 */
const DateInput: React.FC<DateFieldProps> =
    ({
         label,
         value,
         onChange,
         placeholder = "Select date",
         variant = "subtle",
         size = "md",
         showTooltip = true,
         tooltipPosition = "left",
         disabled = false,
         className = "",
         id,
         min,
         max
     }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!disabled) {
                onChange(e.target.value);
            }
        };

        const dateContent = (
            <div className={`date-field-wrap ${size} ${className}`}>
                <div className="date-field-container clarity-ghost">
                    <Calendar size={16} className="field-icon"/>
                    <input
                        id={id}
                        type="date"
                        value={value}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className={`clarity-${variant} input date-field ${size}`}
                        disabled={disabled}
                        aria-label={label}
                        min={min}
                        max={max}
                    />
                </div>
            </div>
        );

        if (showTooltip && label) {
            return (
                <Tooltip text={label} position={tooltipPosition}>
                    {dateContent}
                </Tooltip>
            );
        }

        return dateContent;
    };

export default DateInput;