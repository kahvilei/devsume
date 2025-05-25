import React from "react";
import {ButtonVariant, ColorVariant} from "@/types/designTypes";

interface ChipProps {
    text: string;
    color?: ColorVariant
    variant?: ButtonVariant
}

export const Chip: React.FC<ChipProps> = ({text, color = 'primary', variant='btn-shadow-filled'}) => {
    return (
        <div className={`chip ${variant} ${color}`}><span>{text}</span></div>
    );
}