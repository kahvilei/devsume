import React, {useContext, useEffect, useRef} from 'react';
import OverlayContext from "@/app/_data/OverlayContext";
import PopInOut from "@/app/_components/animations/PopInOut";

export interface PortalOverlayProps {
    children?: React.ReactNode;
    targetRef: React.RefObject<HTMLElement>;
    isOpen: boolean;
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
const PortalOverlay: React.FC<PortalOverlayProps> =
    ({
         children,
         targetRef,
         isOpen,
         placement = 'bottom',
         offset = 4,
         onClickOutside,
         className = '',
         matchWidth = false,
     }) => {
        const overlayRef = useRef<HTMLDivElement>(null);
        const {overlay, setOverlay} = useContext(OverlayContext);

        // Handle click outside
        const handleClickOutside = (event: MouseEvent) => {
            if (
                overlayRef.current &&
                !overlayRef.current.contains(event.target as Node) &&
                targetRef.current &&
                !targetRef.current.contains(event.target as Node) &&
                onClickOutside
            ) {
                onClickOutside();
            }
        };

        const updatePosition = () => {
            if (!targetRef.current || !overlayRef.current) return;

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
        };

        useEffect(() => {
            // Initial positioning
            updatePosition();
        }, [overlay]);

        useEffect(() => {

            if (!isOpen) {
                setOverlay(null);
            } else {
                setOverlay(
                    <div
                        ref={overlayRef}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            pointerEvents: 'auto',
                        }}
                    >
                        <PopInOut layout={false}>
                            <div className={className}>
                                {children}
                            </div>
                        </PopInOut>
                    </div>
                );


                // Update position on window resize or scroll
                window.addEventListener('resize', updatePosition);
                window.addEventListener('scroll', updatePosition);

                if (onClickOutside) {
                    document.addEventListener('mousedown', handleClickOutside);
                }

            }

            return () => {
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition);

                if (onClickOutside) {
                    document.removeEventListener('mousedown', handleClickOutside);
                }
            };

        }, [isOpen, children]);

        return (<div></div>);
    }

export default PortalOverlay;