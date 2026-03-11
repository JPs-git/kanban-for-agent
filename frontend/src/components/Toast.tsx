import React, { useEffect } from 'react';

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

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          borderLeft: '4px solid #388E3C'
        };
      case 'warning':
        return {
          backgroundColor: '#FF9800',
          borderLeft: '4px solid #F57C00'
        };
      case 'error':
        return {
          backgroundColor: '#FF4444',
          borderLeft: '4px solid #D32F2F'
        };
      default:
        return {
          backgroundColor: '#2196F3',
          borderLeft: '4px solid #1565C0'
        };
    }
  };

  return (
    <div className="toast" style={getTypeStyles()}>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>&times;</button>
    </div>
  );
};

export default Toast;