import React from 'react';
import Popover from './Popover';
import {AnimatePresence} from "motion/react";
import PopInOut from "@/app/_components/animations/PopInOut"; // Adjust import path as needed

export type TooltipPosition = 'top' | 'right' | 'left' | 'bottom';

interface TooltipProps {
    text: string;
    position?: TooltipPosition;
    children: React.ReactNode;
    hoverDelay?: number;
}

export const Tooltip: React.FC<TooltipProps> = (
    {
        text,
        position = 'top',
        children,
        hoverDelay = 1000
    }) => {
    if (!text) return <>{children}</>;

    return (
        <Popover
            useHover={true}
            hoverDelay={hoverDelay}
            placement={position}
            usePortal={true}
        >
            <Popover.Target>
                {children}
            </Popover.Target>
            <Popover.Content>
                <AnimatePresence>
                    <PopInOut>
                        <div className="tooltip">
                            {text}
                        </div>
                    </PopInOut>
                </AnimatePresence>
            </Popover.Content>
        </Popover>
    );
};

export default Tooltip;