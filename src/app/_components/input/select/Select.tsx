import React, {useState, useEffect, useId, useRef} from 'react';
import Tooltip from "@/app/_components/layouts/Tooltip";
import PortalOverlay from "@/app/_components/layouts/PortalOverlay";
import {SelectInputProps} from "@/interfaces/components/input";

/**
 * Select component - A styled select dropdown with tooltip support
 *
 * This component follows the WysiwygText pattern from the design system
 * and provides a consistent interface for select inputs with more styling flexibility.
 */
const Select: React.FC<SelectInputProps> =
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

        // Find selected option label when value changes
        useEffect(() => {
            const option = options.find(opt => opt.value === value);
            setSelectedLabel(option ? option.label : '');
        }, [value, options]);

        const [selectOpen, setSelectOpen] = useState(false);
        const triggerRef = useRef<HTMLDivElement>(null);

        // Handle keyboard navigation
        const handleKeyDown = (event: React.KeyboardEvent) => {
            if (disabled) return;

            if (event.key === 'Enter' || event.key === ' ') {
                setSelectOpen(!selectOpen);
                event.preventDefault();
            } else if (event.key === 'Escape') {
                setSelectOpen(false);
                event.preventDefault();
                event.stopPropagation();
            } else if (event.key === 'ArrowDown' && selectOpen) {
                event.preventDefault();
                event.stopPropagation();
                const currentIndex = options.findIndex(opt => opt.value === value);
                const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
                onChange(options[nextIndex].value);
            } else if (event.key === 'ArrowUp' && selectOpen) {
                event.preventDefault();
                event.stopPropagation();
                const currentIndex = options.findIndex(opt => opt.value === value);
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
                onChange(options[prevIndex].value);
            }
        };

        const overlayKey = useId();

        const handleOptionClick = (optionValue: string) => {
            onChange(optionValue);
            setSelectOpen(false);
        };

        const selectContent = (
            <div
                className={`select ${size} ${className}`}
                id={id}
            >
                <div
                    ref={triggerRef}
                    className={`select-trigger ${size} ${selectOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
                    onClick={disabled ? undefined : () => setSelectOpen(!selectOpen)}
                    onKeyDown={handleKeyDown}
                    tabIndex={disabled ? -1 : 0}
                    role="combobox"
                    aria-label={label}
                    aria-expanded={selectOpen}
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
                            className={selectOpen ? 'rotate' : ''}
                        >
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </span>
                </div>

                <PortalOverlay
                    targetRef={triggerRef as React.RefObject<HTMLElement>}
                    isOpen={selectOpen}
                    overlayKey={overlayKey}
                    onClickOutside={() => setSelectOpen(false)}
                    placement="bottom"
                    className="select-dropdown">
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