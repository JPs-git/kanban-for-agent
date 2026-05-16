import React, { useCallback } from "react";
import Toast from "./Toast";
import type { ToastItem } from "../context/ToastContext.types";

interface ToastManagerProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}

const ToastManager: React.FC<ToastManagerProps> = ({ toasts, onClose }) => {
  const handleRemove = useCallback(
    (id: string) => {
      onClose(id);
    },
    [onClose],
  );

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onRemove={handleRemove}
        />
      ))}
    </div>
  );
};

export default ToastManager;
