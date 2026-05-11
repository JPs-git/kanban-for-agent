import React from "react";
import Toast from "./Toast";

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "warning" | "error";
  duration?: number;
}

interface ToastManagerProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}

const ToastManager: React.FC<ToastManagerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onClose(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};

export default ToastManager;
