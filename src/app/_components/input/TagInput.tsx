import React, {useState} from 'react';
import Tooltip, {TooltipPosition} from "@/app/_components/layouts/Tooltip";
import {Size} from "@/types/designTypes";

export interface TextFieldProps {
    label: string;
    value: string[];
    onChange: (value: string[]) => void;
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

const TagInput: React.FC<TextFieldProps> =
    ({
         label,
         value,
         onChange,
         placeholder = "Enter comma separated tags",
         size = "md",
         showTooltip = true,
         tooltipPosition = "above",
         disabled = false,
         className = "",
         id,
         maxLength,
         pattern
     }) => {
        const [inputValue, setInputValue] = useState('');

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (disabled) return;

            const newValue = e.target.value;
            setInputValue(newValue);

            if (newValue.endsWith(',')) {
                const newTag = newValue.slice(0, -1).trim();
                if (newTag && !value.includes(newTag)) {
                    onChange([...value, newTag]);
                }
                setInputValue('');
            }
        };

        const removeTag = (tag: string) => {
            onChange(value.filter(t => t !== tag));
        };

        const textContent = (
            <div className="tag-input-container">
                <div className="tags-wrapper">
                    {value.map((tag, index) => (
                        <span key={index} className="tag">
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="tag-remove"
                                aria-label={`Remove tag ${tag}`}
                            >
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 1L1 5L5 9L9 5L5 1Z" fill="currentColor"/>
                                </svg>
                            </button>
                        </span>
                    ))}
                </div>
                <input
                    id={id}
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    aria-label={label}
                    disabled={disabled}
                    maxLength={maxLength}
                    pattern={pattern}
                />
            </div>
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

export default TagInput;
