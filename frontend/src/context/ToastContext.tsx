import React, { useState, useCallback } from "react";
import type { ReactNode } from "react";
import ToastManager from "../components/ToastManager";
import type { ToastType, ToastItem } from "./ToastContext.types";
import { ToastContext } from "./ToastContext.context";

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addToast = useCallback(
    (message: string, type: ToastType = "success", duration?: number) => {
      const id = generateId();
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      return id;
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success", duration?: number) => {
      addToast(message, type, duration);
    },
    [addToast],
  );

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      addToast(message, "success", duration);
    },
    [addToast],
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      addToast(message, "warning", duration);
    },
    [addToast],
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      addToast(message, "error", duration);
    },
    [addToast],
  );

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showWarning, showError, removeToast }}
    >
      {children}
      <ToastManager toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};
