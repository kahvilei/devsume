import React, {useId} from 'react';
import PortalOverlay from "@/app/_components/layouts/PortalOverlay";

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, setIsOpen, children }: ModalProps) => {
  const key = useId();
  const handleClose = () => {
      setIsOpen(false);
  }

  return (
      <PortalOverlay isOpen={isOpen} overlayKey={key} onClickOutside={handleClose}>
          <div className="modal">
            <div
                className="modal-backdrop"
                onClick={handleClose}
            />
            <div className="modal-container">
              <div>{children}</div>
            </div>
          </div>
      </PortalOverlay>
  );
}

export default Modal;