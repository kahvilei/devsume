// @/app/_components/editor/common/NumberField.tsx
import React from 'react';
import Tooltip from "@/app/_components/common/Tooltip";
import {Hash} from "lucide-react";
import {TooltipPosition} from '../../common/Select';

type ClarityVariant = "ghost" | "subtle" | "default" | "emphasis" | "prominent";
type Size = "xs" | "sm" | "md" | "lg" | "xl";

export interface NumberFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    variant?: ClarityVariant;
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
 * NumberField component - A styled number input with icon and tooltip support
 *
 * Provides a consistent interface for number inputs with validation.
 */
const NumberField: React.FC<NumberFieldProps> =
    ({
         label,
         value,
         onChange,
         placeholder = "Enter number",
         variant = "subtle",
         size = "md",
         min,
         max,
         step = 1,
         showTooltip = true,
         tooltipPosition = "left",
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
            <div className={`number-field-wrap ${size} ${className}`}>
                <div className="number-field-container clarity-ghost">
                    <Hash size={16} className="field-icon"/>
                    <input
                        id={id}
                        type="number"
                        value={value}
                        onChange={handleChange}
                        min={min}
                        max={max}
                        step={step}
                        placeholder={placeholder}
                        className={`clarity-${variant} input number-field ${size}`}
                        disabled={disabled}
                        aria-label={label}
                    />
                </div>
            </div>
        );

        if (showTooltip && label) {
            return (
                <Tooltip text={label} position={tooltipPosition}>
                    {numberContent}
                </Tooltip>
            );
        }

        return numberContent;
    };

export default NumberField;