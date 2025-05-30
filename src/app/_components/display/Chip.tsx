import React from "react";
import {ColorVariant} from "@/types/designTypes";

interface ChipProps {
    text: string;
    color?: ColorVariant
}

export const Chip: React.FC<ChipProps> = ({text, color = 'primary'}) => {
    return (
        <div className={`chip ${color}`}><span>{text}</span></div>
    );
}