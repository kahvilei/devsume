import React, {useState} from 'react';
import Tooltip from "@/app/_components/layouts/Tooltip";
import {TagInputProps} from "@/interfaces/components/input";

const TagInput: React.FC<TagInputProps> = (
    {
        label,
        value = [], // Ensure value defaults to an empty array if not provided
        onChange,
        placeholder = "Enter comma separated tags",
        size = "md",
        showTooltip = true,
        tooltipPosition = "above",
        disabled = false,
        required = false,
        className = "",
        id,
        maxLength,
        pattern,
    }) => {
    const [inputValue, setInputValue] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;

        const newValue = e.target.value;
        setInputValue(newValue);

        if (newValue.endsWith(",")) {
            const newTag = newValue.slice(0, -1).trim();
            if (newTag && !value.includes(newTag)) {
                // Add a new tag if it's not already present in the value
                onChange([...value, newTag]);
            }
            setInputValue(""); // Clear the input field
        }
    };

    const removeTag = (tag: string) => {
        onChange(value.filter((t) => t !== tag)); // Remove the selected tag
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
                            <svg
                                width="10"
                                height="10"
                                viewBox="0 0 10 10"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M5 1L1 5L5 9L9 5L5 1Z"
                                    fill="currentColor"
                                />
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
                required={required}
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