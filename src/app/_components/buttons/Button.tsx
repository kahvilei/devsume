import {ButtonVariant, ColorVariant, RadiusVariant, SizeVariant} from "@/types/designTypes";
import React from "react";

interface ButtonProps {
    icon?: React.ReactNode;
    text: string;
    onClick?: () => void;
    className?: string;
    size?: SizeVariant;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    variant?: ButtonVariant;
    radius?: RadiusVariant;
    color?: ColorVariant;
}

export const Button =
    ({
        icon,
        text,
        onClick,
        className = '',
        size = "md",
        type = "button",
        disabled = false,
        radius = "rounded-full",
        variant = "btn-shadow-spread",
        color = "primary",

     }: ButtonProps) => {
        // Build the class string based on props
        const buttonClasses = [
            'btn',
            size,
            className,
            icon ? 'has-icon' : '',
            variant ? variant : '',
            color ? color : '',
            radius ? radius : '',
        ].filter(Boolean).join(' ');

        return (
            <button
                className={buttonClasses}
                onClick={onClick}
                type={type}
                disabled={disabled}
            >
                {icon && <span className="btn-icon">{icon}</span>}
                <span className="btn-text">{text}</span>
            </button>
        );
    };