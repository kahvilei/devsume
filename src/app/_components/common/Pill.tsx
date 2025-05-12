// @/app/_components/common/Pill.tsx
import React from 'react';
import {Chip} from "@/app/_components/common/Chip";

type ClarityVariant = "ghost" | "subtle" | "default" | "emphasis" | "prominent";
type Size = "xs" | "sm" | "md" | "lg" | "xl";

interface PillProps {
    label: string;
    chip?: string | number;
    onClick: () => void;
    isActive?: boolean;
    icon?: React.ReactNode;
    className?: string;
    variant?: ClarityVariant;
    size?: Size;
    disabled?: boolean;
    ariaLabel?: string;
}

/**
 * Pill component - Used to display an interactive pill with a label and optional value badge
 *
 * This component is a general-purpose UI element that shows a label and an optional value badge.
 * It can be used in various contexts where a compact interactive element is needed.
 * Supports multiple variants and sizes following the Clarity design system.
 */
export const Pill: React.FC<PillProps> =
    ({
         label,
         chip,
         onClick,
         isActive = false,
         icon,
         className = '',
         variant = "ghost",
         size = "md",
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
                className={`pill clarity-${variant} clarity-hover clarity-active ${isActive&&'active'} ${size} ${className} ${disabled ? 'disabled' : ''}`}
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