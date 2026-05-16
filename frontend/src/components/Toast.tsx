import React, { useEffect, useState, useCallback, useRef } from "react";
import { X, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface ToastProps {
  id: string;
  message: string;
  type: "success" | "warning" | "error";
  duration?: number;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  duration = 3000,
  onRemove,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRemove = useCallback(() => {
    onRemove(id);
  }, [id, onRemove]);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIsExiting(true);
      timerRef.current = setTimeout(handleRemove, 300);
    }, duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [duration, handleRemove]);

  const typeStyles = {
    success: {
      bg: "bg-green-500",
      icon: <CheckCircle className="w-5 h-5" />,
    },
    warning: {
      bg: "bg-amber-500",
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    error: {
      bg: "bg-red-500",
      icon: <XCircle className="w-5 h-5" />,
    },
  };

  const style = typeStyles[type];

  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsExiting(true);
    setTimeout(handleRemove, 300);
  };

  return (
    <div
      id={`toast-${id}`}
      className={`${style.bg} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px] max-w-[400px] ${
        isExiting ? "animate-slide-out-right" : "animate-slide-in-right"
      }`}
    >
      {style.icon}
      <div className="flex-1 font-medium text-sm">{message}</div>
      <button
        className="p-1 rounded-full hover:bg-white/20 transition-colors"
        onClick={handleClose}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
