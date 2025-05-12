// @/app/_components/common/ActionIcon.tsx
import React from "react";
import Tooltip from "@/app/_components/common/Tooltip";

type ClarityVariant = "ghost" | "subtle" | "default" | "emphasis" | "prominent";
type Size = "xs" | "sm" | "md" | "lg" | "xl";
type TooltipPosition = "left" | "right" | "above" | "below";

interface ActionIconProps {
    icon: React.ReactNode;
    action: () => void;
    tooltip: string;
    className?: string;
    variant?: ClarityVariant;
    size?: Size;
    tooltipPosition?: TooltipPosition;
    disabled?: boolean;
    ariaLabel?: string;
}

/**
 * ActionIcon Component - A versatile button with an icon that supports tooltips
 *
 * This component provides a simple, reusable button that displays an icon and triggers
 * an action when clicked. It includes tooltip support and respects the Clarity design system.
 */
export const ActionIcon: React.FC<ActionIconProps> =
    ({
         icon,
         action,
         tooltip,
         className = "",
         variant = "ghost",
         size = "md",
         tooltipPosition = "above",
         disabled = false,
         ariaLabel
     }) => {
        const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            if (!disabled) {
                action();
            }
        };

        const buttonContent = (
            <button
                className={`action-icon clarity-${variant} ${size} ${className} ${disabled ? 'disabled' : ''}`}
                onClick={handleClick}
                disabled={disabled}
                aria-label={ariaLabel || tooltip}
            >
                {icon}
            </button>
        );

        if (tooltip && !disabled) {
            return (
                <Tooltip text={tooltip} position={tooltipPosition}>
                    {buttonContent}
                </Tooltip>
            );
        }

        return buttonContent;
    };

export default ActionIcon;