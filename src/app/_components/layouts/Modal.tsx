import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
      <div className="modal">
        <div className="modal-backdrop" onClick={onClose}></div>
        <div className="modal-container">
          <div>{children}</div>
        </div>
      </div>
  );
}