import {SizeVariant} from "@/types/designTypes";
import {TooltipPosition} from "@/app/_components/layouts/Tooltip";
import React from "react";

export default interface InputProps {
    label: string;
    size?: SizeVariant;
    showTooltip?: boolean;
    tooltipPosition?: TooltipPosition;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    id?: string;
}

export interface TextInputProps extends InputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    maxLength?: number;
    pattern?: string;
}

export interface SelectInputProps extends TextInputProps {
    options: DropdownOption[];
}
export interface DropdownOption {
    value: string;
    label: React.ReactNode;
    option: React.ReactNode;
}

export interface TagInputProps extends InputProps {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    maxLength?: number;
    pattern?: string;
}

export interface NumberInputProps extends InputProps {
    value: number;
    onChange: (value: number) => void;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
}

export interface DateInputProps extends InputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    id?: string;
    min?: string; // ISO date string for min date
    max?: string; // ISO date string for max date
}