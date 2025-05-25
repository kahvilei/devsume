import React from 'react';

export type TooltipPosition = 'above' | 'right' | 'left' | 'below';

interface TooltipProps {
    text: string;
    position?: TooltipPosition;
    children: React.ReactNode;
    className?: string;
}

export const Tooltip: React.FC<TooltipProps> = (
    {
        text,
        position = 'below',
        children,
        className = ''
    }) => {
    if (!text) return <>{children}</>;

    return (
        <div className={`tooltip ${className}`}>
            {children}
            <span className={`tooltip tooltip-${position}`}>
        {text}
      </span>
        </div>
    );
};

export default Tooltip;