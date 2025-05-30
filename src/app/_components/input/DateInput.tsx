// @/app/_components/editor/common/DateInput.tsx
import React from 'react';
import Tooltip from "@/app/_components/layouts/Tooltip";
import {Calendar} from "lucide-react";
import {DateInputProps} from "@/interfaces/components/input";

/**
 * DateInput component - A styled date components with icon and tooltip support
 *
 * Provides a consistent interface for date inputs with validation.
 */
const DateInput: React.FC<DateInputProps> =
    ({
         label,
         value,
         onChange,
         placeholder = "Select date",
         size = "md",
         showTooltip = true,
         tooltipPosition = "left",
         disabled = false,
         className = "",
         required = false,
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
                        className={`input date-field ${size}`}
                        disabled={disabled}
                        required={required}
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