import React from "react";
import {LucideIcon} from "lucide-react";
import {ColorVariant, SizeVariant} from "@/types/designTypes";


interface IconProps {
    icon: LucideIcon | React.ReactNode;
    size?: SizeVariant;
    color?: ColorVariant;
    className?: string;
}

const Icon: React.FC<IconProps> = (
    {
        icon,
        size = "md",
        color = "default",
        className = ""
    }) => {

    // Check if icon is a Lucide icon component (function) vs a React node
    if ((icon as LucideIcon).displayName !== undefined) {
        const LucideComponent = icon as LucideIcon;
        return (
            <LucideComponent
                className={`icon ${color} ${className} ${size}`}
                strokeWidth={'0.08rem'}
            />
        );
    }

    // Handle React node case
    return (
        <span className={`icon ${color} ${className} ${size}`}>
            {icon as React.ReactNode}
        </span>
    );
};

export default Icon;