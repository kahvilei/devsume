// @/app/_components/common/Pill.tsx
import React from 'react';
import {Chip} from "@/app/_components/common/display/Chip";
import {ButtonVariant, ColorVariant, RadiusSize, Size} from "@/types/designTypes";

interface PillProps {
    label: string;
    chip?: string | number;
    onClick?: () => void;
    isActive?: boolean;
    icon?: React.ReactNode;
    className?: string;
    variant?: ButtonVariant;
    size?: Size;
    color?: ColorVariant;
    radius?: RadiusSize;
    disabled?: boolean;
    ariaLabel?: string;
}

/**
 * Pill component - Used to display an interactive pill with a label and optional value badge
 *
 * This component is a general-purpose UI element that shows a label and an optional value badge.
 * It can be used in various contexts where a compact interactive element is needed.
 * Supports multiple variants and sizes.
 */
export const Pill: React.FC<PillProps> =
    ({
        label,
        chip,
        onClick = () => {},
        isActive = false,
        icon,
        className = '',
        variant = "btn-border-grow",
        size = "sm",
        color,
        radius = "rounded-full",
        disabled = false,
        ariaLabel
     }) => {

        // Check if value is considered "set" (for badges)
        const hasValue = chip !== undefined && chip !== '' && chip !== 0;

        const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            if (!disabled) {
                onClick();
            }
        };

        return (
            <button
                type="button"
                className={`pill ${variant} ${radius} ${color} ${isActive&&'active'} ${size} ${className} ${disabled ? 'disabled' : ''}`}
                onClick={handleClick}
                disabled={disabled}
                aria-pressed={isActive}
                aria-label={ariaLabel || `${label}: ${chip??''}`}
            >
                {icon && <span className="pill-icon">{icon}</span>}
                <span className="pill-label">{label}</span>
                <span className={`pill-badge ${hasValue ? 'has-value' : ''}`}>
                {chip ? <Chip text={chip.toString()}></Chip> : <Chip color={"disabled"} text="—"></Chip>}
            </span>
            </button>
        );
    };

export default Pill;