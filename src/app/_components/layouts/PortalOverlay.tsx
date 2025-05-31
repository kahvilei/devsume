import React, {useCallback, useContext, useEffect, useRef} from "react";
import OverlayContext from "@/app/_data/Overlay/OverlayContext";
import overlayContext from "@/app/_data/Overlay/OverlayContext";

export interface PortalOverlayProps {
    children?: React.ReactNode;
    targetRef?: React.RefObject<HTMLElement>;
    isOpen: boolean;
    overlayKey: string; // Unique key for this overlay
    placement?: 'bottom' | 'top' | 'left' | 'right';
    offset?: number;
    onClickOutside?: () => void;
    className?: string; // Applied to the inner scrollable container
    matchWidth?: boolean;
    minHeight?: number; // Minimum height for the overlay
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
        isOpen,
        overlayKey,
        placement = 'bottom',
        offset = 5,
        onClickOutside,
        className = '',
        matchWidth = false,
        minHeight = 300,
    }) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const {overlays, setOverlay, removeOverlay, checkNode} = useContext(OverlayContext);

    useEffect(() => {
        if (!isOpen) {
            removeOverlay(overlayKey);
        }
    }, [isOpen, removeOverlay, overlayKey]);

    // Handle click outside
    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (
                overlayRef.current &&
                !overlayRef.current.contains(event.target as Node) &&
                targetRef?.current &&
                !targetRef?.current?.contains(event.target as Node) &&
                onClickOutside
            ) {
                //check first if this overlay has other overlays on top
                if (!checkNode(overlayKey)){
                    onClickOutside();
                }
            }
        },
        [onClickOutside, targetRef, overlayKey, checkNode]
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

        // Calculate available space in each direction
        const availableBottom = viewportHeight - targetRect.bottom - offset;
        const availableTop = targetRect.top - offset;
        const availableRight = viewportWidth - targetRect.right - offset;
        const availableLeft = targetRect.left - offset;

        // Determine preferred width
        const preferredWidth = matchWidth ? targetRect.width : overlayRect.width;

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
                    return availableBottom >= minHeight;
                case 'top':
                    return availableTop >= minHeight;
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

        switch (bestPlacement) {
            case 'bottom':
                top = targetRect.bottom + offset;
                left = targetRect.left;
                maxHeight = `${Math.max(minHeight, availableBottom - 20)}px`;
                break;
            case 'top':
                top = targetRect.top - overlayRect.height - offset;
                left = targetRect.left;
                maxHeight = `${Math.max(minHeight, availableTop)}px`;
                // Adjust top position if content is constrained
                if (availableTop < overlayRect.height) {
                    top = offset;
                }
                break;
            case 'left':
                top = targetRect.top;
                left = targetRect.left - overlayRect.width - offset;
                maxHeight = `${Math.max(minHeight, viewportHeight - top - 20)}px`;
                // Adjust left position if content is constrained
                if (availableLeft < overlayRect.width) {
                    left = offset;
                }
                break;
            case 'right':
                top = targetRect.top;
                left = targetRect.right + offset;
                maxHeight = `${Math.max(minHeight, viewportHeight - top - 20)}px`;
                break;
            default:
                top = targetRect.bottom + offset;
                left = targetRect.left;
                maxHeight = `${Math.max(minHeight, availableBottom - 20)}px`;
                break;
        }

        if (innerElement) {
            console.log(innerElement.offsetHeight, parseInt(maxHeight));
            if (innerElement.offsetHeight > parseInt(maxHeight)){
                innerElement.style.maxHeight = maxHeight;
            }
            innerElement.style.overflowX = 'hidden';
            overlayRef.current.style.opacity = '1';
            // Apply position styles to outer container
            overlayRef.current.style.transform = `translate(${left}px, ${top}px)`;
        }
    }, [matchWidth, offset, placement, targetRef, minHeight]);

    const addOverlay = useCallback(() => {
        setOverlay(
            overlayKey,
            <div
                ref={overlayRef}
                key={overlayKey}
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
    }, [overlayKey, className, children]);

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

        if (onClickOutside) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);

            if (onClickOutside) {
                document.removeEventListener('mousedown', handleClickOutside);
            }
        };
    }, [isOpen, onClickOutside, updatePosition, handleClickOutside]);

    useEffect(() => {
        // Initial positioning
        updatePosition();
    }, [updatePosition, setOverlay, overlays]);

    return null;
};

export default PortalOverlay;