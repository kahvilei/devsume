import React from "react";

type ColorVariant = 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'success' | 'danger' | 'warning' | 'info' | 'disabled';

interface ChipProps {
    text: string;
    color?: ColorVariant
}

export const Chip: React.FC<ChipProps> = ({text, color = 'primary'}) => {
    return (
        <div className={`chip bg-${color}`}>{text}</div>
    );
}