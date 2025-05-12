// @/app/_components/editor/common/SelectField.tsx
import React from 'react';
import Tooltip, {TooltipPosition} from "@/app/_components/common/Tooltip";

type ClarityVariant = "ghost" | "subtle" | "default" | "emphasis" | "prominent";
type Size = "xs" | "sm" | "md" | "lg" | "xl";

export interface DropdownOption {
    value: string;
    label: string;
}

export interface SelectFieldProps {
    label: string;
    value: string;
    options: DropdownOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    variant?: ClarityVariant;
    size?: Size;
    className?: string;
    required?: boolean;
    showTooltip?: boolean;
    tooltipPosition?: TooltipPosition;
    disabled?: boolean;
    id?: string;
}

/**
 * SelectField component - A styled select dropdown with tooltip support
 *
 * This component follows the EditableText pattern from the design system
 * and provides a consistent interface for select inputs.
 */
const SelectField: React.FC<SelectFieldProps> =
    ({
         label,
         value,
         options,
         onChange,
         placeholder = "Select an option",
         variant = "subtle",
         size = "md",
         className = "",
         required = false,
         showTooltip = true,
         tooltipPosition = "left",
         disabled = false,
         id
     }) => {
        const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            if (!disabled) {
                onChange(e.target.value);
            }
        };

        const selectContent = (
            <div className={`select-field-wrap ${size} ${className}`}>
                <select
                    id={id}
                    value={value}
                    onChange={handleChange}
                    aria-label={label}
                    className={`clarity-${variant} input select-field ${size}`}
                    required={required}
                    disabled={disabled}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        );

        if (showTooltip && label) {
            return (
                <Tooltip text={label} position={tooltipPosition}>
                    {selectContent}
                </Tooltip>
            );
        }

        return selectContent;
    };

export default SelectField;