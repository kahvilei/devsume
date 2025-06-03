import React from "react";
import {createPortal} from "react-dom";

export interface PortalProps {
    children?: React.ReactNode;
    target?: React.RefObject<HTMLElement> | string;
    isOpen?: boolean;
}

export default function Portal({children, target, isOpen = false}: PortalProps) {
    const targetElement = (typeof target === 'string' ? document.querySelector(target) : target?.current) ?? document.body;


    if (isOpen){
        return createPortal(
            children, targetElement
        )
    }
    return null;
}
