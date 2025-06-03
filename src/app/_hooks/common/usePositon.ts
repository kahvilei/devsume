import React, {useCallback, useEffect, useState} from "react";

type Placement = 'bottom' | 'top' | 'left' | 'right';

interface UsePositionOptions {
    placement?: Placement;
    offset?: number | string;
    matchWidth?: boolean;
    minHeight?: number | string;
    minWidth?: number | string;
}

function getPixelValue(value?: number | string, fallback = 0): number {
    if (value == null) return fallback;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
        if (value.endsWith("px")) return parseInt(value, 10);
        if (value.endsWith("rem")) return parseFloat(value) * 16;
        return parseInt(value, 10) || fallback;
    }
    return fallback;
}

export function usePosition(
    targetRef: React.RefObject<HTMLElement | null>,
    contentRef: React.RefObject<HTMLElement | null>,
    isOpen: boolean,
    children: React.ReactNode,
    options?: UsePositionOptions
) {
    const {
        placement = 'bottom',
        offset = "0.25rem",
        matchWidth = false,
        minHeight = 0,
        minWidth = "0rem",
    } = options || {};

    const [styles, setStyles] = useState<React.CSSProperties>({
        position: 'fixed',
        top: 0,
        left: 0,
        opacity: 1,
        minWidth,
        minHeight,
    });

    const updatePosition = useCallback(() => {
        const targetEl = targetRef.current;
        const contentEl = contentRef.current;
        if (!targetEl || !contentEl) {
            // Hide if target/content missing
            setStyles(styles => ({ ...styles, opacity: 0 }));
            return;
        }

        const targetRect = targetEl.getBoundingClientRect();
        const overlayRect = contentEl.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        const minHeightPx = getPixelValue(minHeight, 300);
        const minWidthPx = getPixelValue(minWidth, 160);

        // Available space
        const availableBottom = viewportHeight - targetRect.bottom;
        const availableTop = targetRect.top;
        const availableRight = viewportWidth - targetRect.right;
        const availableLeft = targetRect.left;

        // Preferred width
        const preferredWidth = matchWidth
            ? targetRect.width
            : Math.max(overlayRect.width, minWidthPx);

        // Order to try placements
        const fallbackOrder: Placement[] =
            placement === 'bottom' ? ['bottom', 'top', 'right', 'left'] :
                placement === 'top' ? ['top', 'bottom', 'right', 'left'] :
                    placement === 'left' ? ['left', 'right', 'bottom', 'top'] :
                        ['right', 'left', 'bottom', 'top'];

        const hasEnoughSpace = (p: Placement): boolean => {
            switch (p) {
                case 'bottom': return availableBottom >= minHeightPx;
                case 'top': return availableTop >= minHeightPx;
                case 'left': return availableLeft >= preferredWidth;
                case 'right': return availableRight >= preferredWidth;
                default: return false;
            }
        };

        const bestPlacement = fallbackOrder.find(hasEnoughSpace) || placement;

        // Offset in px
        const offsetPx = getPixelValue(offset, 4);

        let top = 0, left = 0, maxHeight = 'none';

        switch (bestPlacement) {
            case 'bottom':
                top = targetRect.bottom;
                left = targetRect.left;
                maxHeight = `${Math.max(minHeightPx, availableBottom - offsetPx)}px`;
                break;
            case 'top':
                top = targetRect.top - overlayRect.height - offsetPx;
                left = targetRect.left;
                maxHeight = `${Math.max(minHeightPx, availableTop - offsetPx)}px`;
                if (availableTop < overlayRect.height) {
                    top = 0;
                }
                break;
            case 'left':
                top = targetRect.top;
                left = targetRect.left - overlayRect.width - offsetPx;
                maxHeight = `${Math.max(minHeightPx, viewportHeight - targetRect.top - 20)}px`;
                if (availableLeft < overlayRect.width) {
                    left = 0;
                }
                break;
            case 'right':
                top = targetRect.top;
                left = targetRect.right;
                maxHeight = `${Math.max(minHeightPx, viewportHeight - targetRect.top - 20)}px`;
                break;
        }

        const padding = offsetPx;

        setStyles({
            position: "fixed",
            top,
            padding: `
                ${bestPlacement==="bottom"?padding:0}px 
                ${bestPlacement==="left"?padding:0}px 
                ${bestPlacement==="right"?padding:0}px 
                ${bestPlacement==="top"?padding:0}px`,
            left,
            minWidth: matchWidth ? targetRect.width : minWidth,
            minHeight,
            maxHeight,
            width: matchWidth ? targetRect.width : undefined,
            overflowX: "hidden",
            opacity: 1,
            zIndex: 50,
        });
    }, [targetRef, contentRef, placement, offset, matchWidth, minHeight, minWidth]);

    useEffect(() => {
        updatePosition();

        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };

    }, [targetRef, contentRef, children, updatePosition, isOpen]);
    
    

    return styles;
}