import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import OverlayContext from "@/app/_data/Overlay/OverlayContext";

export interface PortalOverlayProps {
    children?: React.ReactNode;
    targetRef?: React.RefObject<HTMLElement>;
    isOpen?: boolean;
    overlayKey: string; // Unique key for this overlay
    placement?: 'bottom' | 'top' | 'left' | 'right';
    offset?: number;
    onClickOutside?: () => void;
    className?: string; // Applied to the inner scrollable container
    matchWidth?: boolean;
    minHeight?: number | string; // Minimum height for the overlay
    minWidth?: number | string; // Minimum width for the overlay
    hoverMode?: boolean; // Enable hover to show/hide overlay
    hoverDelay?: number; // Delay before hiding on mouse leave
}

/**
 * PortalOverlay - A utility component that renders content to the Overlay container
 * positioned relative to a target element with edge detection and automatic repositioning.
 * Height constraints and overflow are applied to the inner container that receives the className.
 */
const PortalOverlay: React.FC<PortalOverlayProps> = (
    {
        children,
        targetRef,
        isOpen: controlledIsOpen,
        overlayKey,
        placement = 'bottom',
        offset = 5,
        onClickOutside,
        className = '',
        matchWidth = false,
        minHeight = 300,
        minWidth = '10rem',
        hoverMode = false,
        hoverDelay = 200,
    }) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const hoverTimeoutRef = useRef<NodeJS.Timeout>();
    const [hoverOpen, setHoverOpen] = useState(false);
    const {overlays, setOverlay, removeOverlay, checkNode} = useContext(OverlayContext);

    // Determine if overlay should be open
    const isOpen = hoverMode ? hoverOpen : (controlledIsOpen ?? false);

    // Convert minHeight/minWidth to pixels for calculations
    const getPixelValue = (value: number | string): number => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            if (value.endsWith('px')) return parseInt(value);
            if (value.endsWith('rem')) return parseInt(value) * 16;
            return parseInt(value) || 0;
        }
        return 0;
    };

    const minHeightPx = getPixelValue(minHeight);
    const minWidthPx = getPixelValue(minWidth);

    useEffect(() => {
        if (!isOpen) {
            removeOverlay(overlayKey);
        }
    }, [isOpen, removeOverlay, overlayKey]);

    // Handle hover for target element
    useEffect(() => {
        if (!hoverMode || !targetRef?.current) return;

        const target = targetRef.current;

        const handleMouseEnter = () => {
            clearTimeout(hoverTimeoutRef.current);
            setHoverOpen(true);
        };

        const handleMouseLeave = (e: MouseEvent) => {
            // Check if mouse is moving to the overlay
            const relatedTarget = e.relatedTarget as Node;
            if (relatedTarget && overlayRef.current?.contains(relatedTarget)) {
                return; // Don't hide if moving to overlay
            }

            hoverTimeoutRef.current = setTimeout(() => {
                setHoverOpen(false);
            }, hoverDelay);
        };

        target.addEventListener('mouseenter', handleMouseEnter);
        target.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            target.removeEventListener('mouseenter', handleMouseEnter);
            target.removeEventListener('mouseleave', handleMouseLeave);
            clearTimeout(hoverTimeoutRef.current);
        };
    }, [hoverMode, hoverDelay]); // targetRef is stable, don't need it in deps

    // Handle click outside
    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (
                overlayRef.current &&
                !overlayRef.current.contains(event.target as Node) &&
                targetRef?.current &&
                !targetRef?.current?.contains(event.target as Node) &&
                onClickOutside &&
                !hoverMode
            ) {
                //check first if this overlay has other overlays on top
                if (!checkNode(overlayKey)){
                    onClickOutside();
                }
            }
        },
        [onClickOutside, targetRef, overlayKey, checkNode, hoverMode]
    );

    const updatePosition = useCallback(() => {
        if (!targetRef?.current || !overlayRef.current) {
            if (!overlayRef.current){
                return;
            } else {
                overlayRef.current.style.opacity = '1';
                return;
            }
        }

        const targetRect = targetRef.current.getBoundingClientRect();
        const overlayRect = overlayRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        const innerElement = overlayRef.current.firstElementChild?.firstElementChild as HTMLElement;

        // Use 0 offset for hover mode to ensure overlay touches target
        const effectiveOffset = hoverMode ? 0 : offset;

        // Calculate available space in each direction
        const availableBottom = viewportHeight - targetRect.bottom - effectiveOffset;
        const availableTop = targetRect.top - effectiveOffset;
        const availableRight = viewportWidth - targetRect.right - effectiveOffset;
        const availableLeft = targetRect.left - effectiveOffset;

        // Determine preferred width
        const preferredWidth = matchWidth ? targetRect.width : Math.max(overlayRect.width, minWidthPx);

        // Find the best placement based on available space
        let bestPlacement = placement;
        let fallbackOrder: Array<'bottom' | 'top' | 'left' | 'right'> = [];

        // Define fallback order based on original placement
        switch (placement) {
            case 'bottom':
                fallbackOrder = ['bottom', 'top', 'right', 'left'];
                break;
            case 'top':
                fallbackOrder = ['top', 'bottom', 'right', 'left'];
                break;
            case 'left':
                fallbackOrder = ['left', 'right', 'bottom', 'top'];
                break;
            case 'right':
                fallbackOrder = ['right', 'left', 'bottom', 'top'];
                break;
        }

        // Check if we have enough space for each placement
        const hasEnoughSpace = (p: typeof placement): boolean => {
            switch (p) {
                case 'bottom':
                    return availableBottom >= minHeightPx;
                case 'top':
                    return availableTop >= minHeightPx;
                case 'left':
                    return availableLeft >= preferredWidth;
                case 'right':
                    return availableRight >= preferredWidth;
                default:
                    return false;
            }
        };

        // Find the first placement that has enough space
        bestPlacement = fallbackOrder.find(hasEnoughSpace) || placement;

        // Calculate position and constraints based on best placement
        let top = 0;
        let left = 0;
        let maxHeight = 'none';

        // Apply width if matching is requested
        if (matchWidth) {
            if (innerElement) {
                innerElement.style.width = `${targetRect.width}px`;
            }
        }

        // Apply min width
        if (innerElement) {
            innerElement.style.minWidth = typeof minWidth === 'string' ? minWidth : `${minWidth}px`;
            innerElement.style.minHeight = typeof minHeight === 'string' ? minHeight : `${minHeight}px`;
        }

        switch (bestPlacement) {
            case 'bottom':
                top = targetRect.bottom + effectiveOffset;
                left = targetRect.left;
                maxHeight = `${Math.max(minHeightPx, availableBottom - 20)}px`;
                break;
            case 'top':
                top = targetRect.top - overlayRect.height - effectiveOffset;
                left = targetRect.left;
                maxHeight = `${Math.max(minHeightPx, availableTop)}px`;
                // Adjust top position if content is constrained
                if (availableTop < overlayRect.height) {
                    top = effectiveOffset;
                }
                break;
            case 'left':
                top = targetRect.top;
                left = targetRect.left - overlayRect.width - effectiveOffset;
                maxHeight = `${Math.max(minHeightPx, viewportHeight - top - 20)}px`;
                // Adjust left position if content is constrained
                if (availableLeft < overlayRect.width) {
                    left = effectiveOffset;
                }
                break;
            case 'right':
                top = targetRect.top;
                left = targetRect.right + effectiveOffset;
                maxHeight = `${Math.max(minHeightPx, viewportHeight - top - 20)}px`;
                break;
            default:
                top = targetRect.bottom + effectiveOffset;
                left = targetRect.left;
                maxHeight = `${Math.max(minHeightPx, availableBottom - 20)}px`;
                break;
        }

        if (innerElement) {
            if (innerElement.offsetHeight > parseInt(maxHeight)){
                innerElement.style.maxHeight = maxHeight;
            }
            innerElement.style.overflowX = 'hidden';
            overlayRef.current.style.opacity = '1';
            // Apply position styles to outer container
            overlayRef.current.style.transform = `translate(${left}px, ${top}px)`;
        }
    }, [matchWidth, offset, placement, targetRef, minHeightPx, minWidthPx, hoverMode, minHeight, minWidth]);

    const addOverlay = useCallback(() => {
        const handleOverlayMouseEnter = () => {
            if (hoverMode) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };

        const handleOverlayMouseLeave = (e: React.MouseEvent) => {
            if (hoverMode) {
                // Check if mouse is moving to the target
                const relatedTarget = e.relatedTarget as Node;
                if (relatedTarget && targetRef?.current?.contains(relatedTarget)) {
                    return; // Don't hide if moving to target
                }

                hoverTimeoutRef.current = setTimeout(() => {
                    setHoverOpen(false);
                }, hoverDelay);
            }
        };

        setOverlay(
            overlayKey,
            <div
                ref={overlayRef}
                key={overlayKey}
                onMouseEnter={handleOverlayMouseEnter}
                onMouseLeave={handleOverlayMouseLeave}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    opacity: 0,
                    pointerEvents: 'auto',
                }}
            >
                <div className={className}>{children}</div>
            </div>
        );
    }, [overlayKey, className, children, hoverMode, hoverDelay, targetRef]); // setOverlay is stable

    useEffect(() => {
        if (isOpen) {
            addOverlay();
        }
    }, [isOpen, children, addOverlay, overlayKey]);

    useEffect(() => {
        if (!isOpen) return;

        // Update position on window resize or scroll
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition);

        if (onClickOutside && !hoverMode) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);

            if (onClickOutside && !hoverMode) {
                document.removeEventListener('mousedown', handleClickOutside);
            }
        };
    }, [isOpen, onClickOutside, updatePosition, handleClickOutside, hoverMode]);

    useEffect(() => {
        // Initial positioning
        updatePosition();
    }, [updatePosition, setOverlay, overlays]);

    return null;
};

export default PortalOverlay;