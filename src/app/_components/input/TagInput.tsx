import React, {useState} from 'react';
import Tooltip from "@/app/_components/layouts/Tooltip";
import {TagInputProps} from "@/interfaces/components/input";
import {X} from "lucide-react";
import ActionIcon from "@/app/_components/buttons/ActionIcon";

const TagInput: React.FC<TagInputProps> = (
    {
        label,
        value = [], // Ensure value defaults to an empty array if not provided
        onChange,
        placeholder = "Enter comma separated tags",
        size = "md",
        tooltipPosition = "top",
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
           updateValue();
        }
    };

    const updateValue = () => {
        const newTag = inputValue.trim();
        if (newTag && !value.includes(newTag)) {
            // Add a _new tag if it's not already present in the value
            onChange([...value, newTag]);
        }
        setInputValue(""); // Clear the input field
    }


    const removeTag = (tag: string) => {
        onChange(value.filter((t) => t !== tag)); // Remove the selected tag
    };

    return (
        <div className={"tag-input max-w-full" + className}>
            <Tooltip text={label} position={tooltipPosition}>
                <input
                    id={id}
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            updateValue();
                        }
                    }}
                    placeholder={placeholder}
                    aria-label={label}
                    disabled={disabled}
                    maxLength={maxLength}
                    pattern={pattern}
                    required={required}
                />
            </Tooltip>
            <div className="tags-wrapper flex flex-wrap gap-xs">
                {value.map((tag, index) => (
                    <span key={index} className="tag primary rounded-full">
                        {tag}
                        <ActionIcon
                            icon={<X/>}
                            onClick={() => removeTag(tag)}
                            tooltip="Remove tag"
                            size="xs"
                        />
                    </span>
                ))}
            </div>
        </div>
    );
};

export default TagInput;