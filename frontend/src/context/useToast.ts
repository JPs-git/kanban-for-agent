import { useContext } from 'react';
import type { ToastContextType } from './ToastContext.types';
import { ToastContext } from './ToastContext.context';

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};