"use client"

import { createPortal } from 'react-dom';
import { createContext, useContext, useMemo, useState } from 'react';

type ModalContextType = {
    isOpen: boolean;
  openModal: (content: React.ReactNode, size?: "default" | "fullscreen") => void;
    closeModal: () => void;
    modalContent: React.ReactNode | null;
  modalSize: "default" | "fullscreen";
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [modalSize, setModalSize] = useState<"default" | "fullscreen">("default");

  const openModal = (content: React.ReactNode, size: "default" | "fullscreen" = "default") => {
    setModalContent(content);
    setModalSize(size);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalContent(null);
    setModalSize("default");
  };

  const value = useMemo(() => ({
    isOpen,
    openModal,
    closeModal,
    modalContent,
    modalSize,
  }), [isOpen, modalContent, modalSize]);

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
  const { isOpen, modalContent, modalSize } = useModal();
  const mountNode = typeof document === "undefined" ? null : document.getElementById("modal-root");

  if (!isOpen || !mountNode) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className={
        modalSize === "fullscreen"
          ? "relative h-full w-full max-w-none overflow-hidden rounded-xl border border-border bg-card p-4 shadow-xl flex flex-col"
          : "relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl transition-all border border-gray-100 flex flex-col gap-4"
      }>
        {modalContent}
      </div>
    </div>,
    mountNode
  );
}