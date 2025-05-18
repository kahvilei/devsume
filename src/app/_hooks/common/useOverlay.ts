import { useRef, useState, useCallback } from 'react';

interface UseOverlayOptions {
    initialOpen?: boolean;
    placement?: 'bottom' | 'top' | 'left' | 'right';
    offset?: number;
    onOpen?: () => void;
    onClose?: () => void;
    matchWidth?: boolean;
    zIndex?: number;
}

/**
 * useOverlay - Custom hook for managing overlay state and positioning
 *
 * This hook provides state management and handlers for components that need
 * to display content in an overlay (dropdowns, tooltips, popovers, etc.)
 */
const useOverlay = (options: UseOverlayOptions = {}) => {
    const {
        initialOpen = false,
        placement = 'bottom',
        offset = 4,
        onOpen,
        onClose,
        matchWidth = false,
        zIndex = 1000,
    } = options;

    const [isOpen, setIsOpen] = useState(initialOpen);
    const triggerRef = useRef<HTMLDivElement>(null);

    const open = useCallback(() => {
        setIsOpen(true);
        onOpen?.();
    }, [onOpen]);

    const close = useCallback(() => {
        setIsOpen(false);
        onClose?.();
    }, [onClose]);

    const toggle = useCallback(() => {
        if (isOpen) {
            close();
        } else {
            open();
        }
    }, [isOpen, open, close]);

    const overlayProps = {
        targetRef: triggerRef,
        isOpen,
        placement,
        offset,
        onClickOutside: close,
        matchWidth,
        zIndex,
    };

    return {
        isOpen,
        open,
        close,
        toggle,
        triggerRef,
        overlayProps,
    };
};

export default useOverlay;