import React, {useCallback, useContext, useEffect, useRef} from "react";
import OverlayContext from "@/app/_data/Overlay/OverlayContext";
import ScaleInDownUpOut from "@/app/_components/animations/ScaleInDownUpOut";

export interface PortalOverlayProps {
    children?: React.ReactNode;
    targetRef?: React.RefObject<HTMLElement>;
    isOpen: boolean;
    overlayKey: string; // Unique key for this overlay
    placement?: 'bottom' | 'top' | 'left' | 'right';
    offset?: number;
    onClickOutside?: () => void;
    className?: string;
    matchWidth?: boolean;
}

/**
 * PortalOverlay - A utility component that renders content to the Overlay container
 * positioned relative to a target element
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
    }) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const {setOverlay, removeOverlay, checkNode} = useContext(OverlayContext);

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

        let top = 0;
        let left = 0;

        // Calculate position based on placement
        switch (placement) {
            case 'bottom':
                top = targetRect.bottom + offset;
                left = targetRect.left;
                break;
            case 'top':
                top = targetRect.top - overlayRect.height - offset;
                left = targetRect.left;
                break;
            case 'left':
                top = targetRect.top;
                left = targetRect.left - overlayRect.width - offset;
                break;
            case 'right':
                top = targetRect.top;
                left = targetRect.right + offset;
                break;
        }

        // Apply width if matching is requested
        if (matchWidth) {
            overlayRef.current.style.width = `${targetRect.width}px`;
        }

        // Position the overlay
        overlayRef.current.style.transform = `translate(${left}px, ${top}px)`;
        overlayRef.current.style.opacity = '1';
    }, [matchWidth, offset, placement, targetRef]);

    const updateOverlay = useCallback(() => {
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
        if (!isOpen) {
            console.log('removing overlay');
            removeOverlay(overlayKey);
            return;
        } else {
            updateOverlay();
        }
    }, [isOpen, children, updateOverlay, overlayKey]);

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
    }, [updatePosition, setOverlay]);

    return null;
};

export default PortalOverlay;