import React, { useState, useEffect } from 'react';
import Tooltip, { TooltipPosition } from "@/app/_components/common/Tooltip";
import { Size } from "@/types/designTypes";
import useOverlay from "@/app/_hooks/common/useOverlay";
import PortalOverlay, {PortalOverlayProps} from "@/app/_components/common/PortalOverlay";

export interface DropdownOption {
    value: string;
    label: React.ReactNode;
    option: React.ReactNode;
}

export interface SelectFieldProps {
    label: string;
    value: string;
    options: DropdownOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    size?: Size;
    className?: string;
    required?: boolean;
    showTooltip?: boolean;
    tooltipPosition?: TooltipPosition;
    disabled?: boolean;
    id?: string;
}

/**
 * Select component - A styled select dropdown with tooltip support
 *
 * This component follows the EditableText pattern from the design system
 * and provides a consistent interface for select inputs with more styling flexibility.
 */
const Select: React.FC<SelectFieldProps> =
    ({
         label,
         value,
         options,
         onChange,
         placeholder = "Select an option",
         size = "md",
         className = "",
         required = false,
         showTooltip = true,
         tooltipPosition = "above",
         disabled = false,
         id
     }) => {
        const [selectedLabel, setSelectedLabel] = useState('' as React.ReactNode);

        // Use our custom overlay hook
        const {
            isOpen,
            toggle,
            close,
            triggerRef,
            overlayProps
        } = useOverlay({
            placement: 'bottom',
            matchWidth: true,
            zIndex: 1, // Use the same z-index as in your CSS
        });

        // Find selected option label when value changes
        useEffect(() => {
            const option = options.find(opt => opt.value === value);
            setSelectedLabel(option ? option.label : '');
        }, [value, options]);

        // Handle keyboard navigation
        const handleKeyDown = (event: React.KeyboardEvent) => {
            if (disabled) return;

            if (event.key === 'Enter' || event.key === ' ') {
                toggle();
                event.preventDefault();
            } else if (event.key === 'Escape') {
                close();
            } else if (event.key === 'ArrowDown' && isOpen) {
                event.preventDefault();
                event.stopPropagation();
                const currentIndex = options.findIndex(opt => opt.value === value);
                const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
                onChange(options[nextIndex].value);
            } else if (event.key === 'ArrowUp' && isOpen) {
                event.preventDefault();
                event.stopPropagation();
                const currentIndex = options.findIndex(opt => opt.value === value);
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
                onChange(options[prevIndex].value);
            }
        };

        const handleOptionClick = (optionValue: string) => {
            onChange(optionValue);
            close();
        };

        const selectContent = (
            <div
                className={`select ${size} ${className}`}
                id={id}
            >
                <div
                    ref={triggerRef}
                    className={`select-trigger ${size} ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
                    onClick={disabled ? undefined : toggle}
                    onKeyDown={handleKeyDown}
                    tabIndex={disabled ? -1 : 0}
                    role="combobox"
                    aria-label={label}
                    aria-expanded={isOpen}
                    aria-controls="select-options"
                    aria-required={required}
                    aria-haspopup="listbox"
                    data-placeholder={!value && placeholder}
                >
                    <span className={`select-value ${!value ? 'placeholder' : ''}`}>
                        {value ? selectedLabel : placeholder}
                    </span>
                    <span className="select-arrow">
                        <svg
                            width="10"
                            height="6"
                            viewBox="0 0 10 6"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className={isOpen ? 'rotate' : ''}
                        >
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </span>
                </div>

                <PortalOverlay {...overlayProps as PortalOverlayProps} className="select-dropdown">
                    <div
                        id="select-options"
                        role="listbox"
                    >
                        {options.map((option) => (
                            <div
                                key={option.value}
                                className={`select-option ${option.value === value ? 'selected' : ''}`}
                                onClick={() => handleOptionClick(option.value)}
                                role="option"
                                aria-selected={option.value === value}
                            >
                                {option.option}
                            </div>
                        ))}
                    </div>
                </PortalOverlay>
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

export default Select;