import React, {JSXElementConstructor, RefObject, useEffect, useRef, useState} from "react";
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
    closeOnClickOutside?: boolean;
    matchWidth?: boolean;
    height?: number | string;
    minWidth?: number | string;
    useHover?: boolean;
    hoverDelay?: number;
    usePortal?: boolean;
    trapFocus?: boolean;
}

function Popover(
    {
        children,
        usePortal = false,
        isOpen = false,
        setIsOpen,
        onClickOutside,
        closeOnClickOutside,
        trapFocus = false,
        useHover = false,
        hoverDelay = 10,
        ...props
    }: PopoverProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(isOpen);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setInternalIsOpen(isOpen);
    }, [isOpen]);

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

    const clearHoverTimeout = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    };

    const target = getChildrenByType(children, Popover.Target.name);
    const targetRef = useRef<HTMLDivElement>(null)
    const content = getChildrenByType(children, Popover.Content.name);
    const contentRef = useRef<HTMLDivElement>(null)

    const position = usePosition(targetRef, contentRef, internalIsOpen, children, props);

    // Handle click outside to close popover
    useClickOutside(contentRef, () => {
        if (internalIsOpen) {
            if (closeOnClickOutside) {
                setInternalIsOpen(false);
            }
            onClickOutside?.();
        }
    }, targetRef);

    const handleMouseEnter = () => {
        if (useHover) {
            clearHoverTimeout();
            hoverTimeoutRef.current = setTimeout(() => {
                handleChangeIsOpen(true);
            }, hoverDelay);
        }
    };

    const handleMouseLeave = () => {
        if (useHover) {
            clearHoverTimeout();
            handleChangeIsOpen(false);
        }
    };

    const handleFocus = () => {
        if (useHover) {
            clearHoverTimeout();
            handleChangeIsOpen(true);
        }
    };

    const handleBlur = () => {
        if (useHover) {
            clearHoverTimeout();
            hoverTimeoutRef.current = setTimeout(() => {
                handleChangeIsOpen(false);
            }, hoverDelay);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent event bubbling
        clearHoverTimeout();
        if (!useHover) {
            handleChangeIsOpen(!internalIsOpen);
        }
    };

    const targetEvents = {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onFocus: handleFocus,
        onBlur: handleBlur,
        onClick: handleClick,
    };

    const contentEvents = {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
    };

    // Focus management for accessibility
    useEffect(() => {
        if (internalIsOpen && trapFocus && contentRef.current) {
            const focusableElements = contentRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            if (firstElement) {
                firstElement.focus();
            }
        }
    }, [internalIsOpen, trapFocus]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            clearHoverTimeout();
        };
    }, []);

    return (
        <div style={{position: 'relative'}}>
            <div ref={targetRef} {...targetEvents}>
                {target}
            </div>

            {internalIsOpen && (
                usePortal ? (
                    <Portal isOpen={internalIsOpen}>
                        <div
                            ref={contentRef}
                            style={{...position}}
                            {...contentEvents}
                        >
                            {content}
                        </div>
                    </Portal>
                ) : (
                    <div
                        ref={contentRef}
                        style={{...position}}
                        {...contentEvents}
                    >
                        {content}
                    </div>
                )
            )}
        </div>
    )
}

const Target = ({children}: { children: React.ReactNode }) => {
    return (
        children
    )
}

Popover.Target = Target;

const Content = ({children}: { children: React.ReactNode }) => {
    return (
        children
    )
}

Popover.Content = Content;

export default Popover;