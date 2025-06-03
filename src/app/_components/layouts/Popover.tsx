import React, {JSXElementConstructor, useEffect, useRef, useState} from "react";
import Portal from "@/app/_components/layouts/Portal";
import {usePosition} from "@/app/_hooks/common/usePositon";
import {useClickOutside} from "@/app/_hooks/common/useClickOutside";

export interface PopoverProps {
    children: React.ReactNode;
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
    placement?: 'bottom' | 'top' | 'left' | 'right';
    offset?: number | string;
    onClickOutside?: () => void;
    matchWidth?: boolean;
    height?: number | string;
    minWidth?: number | string;
    useHover?: boolean;
    hoverDelay?: number;
    usePortal?: boolean;
    trapFocus?: boolean;
}

function Popover({
    children,
    usePortal = false,
    isOpen = false,
    setIsOpen,
    onClickOutside,
    trapFocus = false,
    useHover = false,
    hoverDelay = 10,
    ...props
}: PopoverProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(isOpen);

    const getChildrenByType = (children: React.ReactNode, type: string) => {
        if (!children) return;
        for (const child of React.Children.toArray(children)) {
            if (!React.isValidElement(child)) continue;
            if ((child.type as JSXElementConstructor<never>)?.name === type) {
                return child;
            }
        }
    }
    
    const handleChangeIsOpen = (open: boolean) => {
        setInternalIsOpen(open);
        if (typeof setIsOpen === 'function') {
            setIsOpen(open);
        }
    }

    const target = getChildrenByType(children, Popover.Target.name);
    const targetRef = useRef<HTMLDivElement>(null)
    const content = getChildrenByType(children, Popover.Content.name);
    const contentRef = useRef<HTMLDivElement>(null)

    const position = usePosition(targetRef, contentRef, internalIsOpen, children, props);

    useClickOutside(contentRef, onClickOutside);

    const coreEvents = {
        onMouseEnter: (e: { preventDefault: () => void; }) => {
            e.preventDefault();
            if (useHover) {
                setTimeout(() => {
                    handleChangeIsOpen(true);

                }, hoverDelay);
            }
        },
        onMouseLeave: (e: { preventDefault: () => void; }) => {
            e.preventDefault();
            if (useHover) {
                setTimeout(() => {
                    handleChangeIsOpen(false);
                }, hoverDelay);
            }
        },
        onFocus: (e: { preventDefault: () => void; }) => {
            e.preventDefault();
            if (useHover) {
                setTimeout(() => {
                    handleChangeIsOpen(true);
                })
            }
        },
        onBlur: (e: { preventDefault: () => void; }) => {
            e.preventDefault();
            if (useHover) {
                setTimeout(() => {
                    handleChangeIsOpen(false);
                })
            }
        }
    }

    const events = {
        ...coreEvents,
        onClick: (e: { preventDefault: () => void; }) => {
            e.preventDefault();
            if (!useHover) {
                handleChangeIsOpen(!internalIsOpen);
            }
        },
    }

    return (
        <div style={{
            position: 'relative',
        }}>
            <div ref={targetRef}
                 {...events}
            >
                {target}
            </div>

            {usePortal ?
                internalIsOpen &&
                <Portal>
                    <div
                        ref={contentRef}
                        style={{...position}}
                        {...coreEvents}
                        autoFocus={trapFocus}
                    >
                        {content}
                    </div>
                </Portal>
            : internalIsOpen &&
                <div
                    ref={contentRef}
                    style={{...position}}
                    {...coreEvents}
                    autoFocus={trapFocus}
                >
                    {content}
                </div>
            }
        </div>
    )
}

const Target = ({children}: {children: React.ReactNode}) => {
    return (
        children
    )
}

Popover.Target = Target;


const Content = ({children}: {children: React.ReactNode}) => {
    return (
        children
    )
}

Popover.Content = Content;


export default Popover;