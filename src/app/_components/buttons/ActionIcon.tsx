import React from "react";
import Tooltip, {TooltipPosition} from "@/app/_components/layouts/Tooltip";
import {ButtonVariant, ColorVariant, RadiusVariant, SizeVariant} from "@/types/designTypes";

interface ActionIconProps {
    icon: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
    onClick?: () => void;
    tooltip: string;
    className?: string;
    variant?: ButtonVariant;
    color?: ColorVariant;
    radius?: RadiusVariant;
    size?: SizeVariant;
    tooltipPosition?: TooltipPosition;
    disabled?: boolean;
    ariaLabel?: string;
}

/**
 * ActionIcon Component - A versatile button with an icon that supports tooltips
 *
 * This component provides a simple, reusable button that displays an icon and triggers
 * an action when clicked. It includes tooltip support.
 */
export const ActionIcon: React.FC<ActionIconProps> =
    ({
         icon,
         onClick,
         type,
         tooltip,
         tooltipPosition = "bottom",
         className = "",
         disabled = false,
         ariaLabel,
         size = "md",
         radius = "rounded-full",
         variant = "btn-shadow-spread",
         color = "",
     }) => {
        const handleClick = (e: React.MouseEvent) => {
            if (!onClick) return;
            e.stopPropagation();
            e.preventDefault();
            if (!disabled && onClick && typeof onClick === 'function' && onClick.constructor === Function) {
                onClick();
            }
        };

        const buttonContent = (
            <button
                className={`action-icon ${variant} ${color} ${radius} ${size} ${disabled ? 'disabled' : ''}`}
                type={ (type || "button")}
                onClick={handleClick}
                disabled={disabled}
                aria-label={ariaLabel || tooltip}
            >
                {icon}
            </button>
        );

        if (tooltip && !disabled) {
            return (
                <div className={`action-icon-wrap ${className}`}>
                    <Tooltip text={tooltip} position={tooltipPosition}>
                        {buttonContent}
                    </Tooltip>
                </div>
            );
        }

        return buttonContent;
    };

export default ActionIcon;
