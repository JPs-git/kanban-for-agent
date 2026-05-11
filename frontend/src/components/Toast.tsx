import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'warning' | 'error';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      bg: 'bg-green-500',
      icon: <CheckCircle className="w-5 h-5" />,
    },
    warning: {
      bg: 'bg-amber-500',
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    error: {
      bg: 'bg-red-500',
      icon: <XCircle className="w-5 h-5" />,
    },
  };

  const style = typeStyles[type];

  return (
    <div className={`${style.bg} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px] max-w-[400px] animate-slide-in-right`}>
      {style.icon}
      <div className="flex-1 font-medium text-sm">{message}</div>
      <button 
        className="p-1 rounded-full hover:bg-white/20 transition-colors"
        onClick={onClose}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
