import React, {useId} from 'react';
import PortalOverlay from "@/app/_components/layouts/PortalOverlay";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  const key = useId();
  const [modalOpen, setModalOpen] = React.useState(isOpen);

  return (
      <PortalOverlay isOpen={modalOpen} overlayKey={key}>
          <div className="modal">
            <div
                className="modal-backdrop"
                onClick={() => {
                    setModalOpen(false);
                    onClose();
                }
            }>
            </div>
            <div className="modal-container">
              <div>{children}</div>
            </div>
          </div>
      </PortalOverlay>
  );
}