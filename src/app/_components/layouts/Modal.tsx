import React, {useCallback} from 'react';
import Portal from "@/app/_components/layouts/Portal";

interface ModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    children: React.ReactNode;
}

export const Modal = ({ isOpen, setIsOpen, children }: ModalProps) => {

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, [setIsOpen]);

    return (
        <Portal isOpen={isOpen}>
            <div className="modal">
                <div
                    className="modal-backdrop"
                    onClick={handleClose}
                />
                <div className="modal-container">
                    <div>{children}</div>
                </div>
            </div>
        </Portal>
    );
}

export default Modal;