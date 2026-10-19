"use client"

import { createPortal } from 'react-dom';
import {  useEffect, createContext, useContext, useMemo, useState } from 'react';

type ModalContextType = {
    isOpen: boolean;
    openModal: (content: React.ReactNode) => void;
    closeModal: () => void;
    modalContent: React.ReactNode | null;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);

  const openModal = (content: React.ReactNode) => {
    setModalContent(content);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalContent(null);
  };

  const value = useMemo(() => ({
    isOpen,
    openModal,
    closeModal,
    modalContent
  }), [isOpen, modalContent]);

  return (
    <ModalContext value={value}>
      {children}
    </ModalContext>
  );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}

export default function Modal() {
  const { isOpen, closeModal, modalContent } = useModal();
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMountNode(document.getElementById('modal-root'));
  }, []);

  if (!isOpen || !mountNode) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl transition-all border border-gray-100 flex flex-col gap-4">
        {modalContent}
      </div>
    </div>,
    mountNode
  );
}