import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const bgStyles = {
    success: 'bg-mint text-foreground border-foreground',
    error: 'bg-primary text-foreground border-foreground',
    info: 'bg-butter text-foreground border-foreground',
  }[toast.type];

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-12 right-6 z-50 flex items-center gap-3 animate-bounce"
    >
      <div
        className={`sticker shadow-ink flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold border-[3px] ${bgStyles}`}
      >
        <span>
          {toast.type === 'success' ? '✅' : toast.type === 'error' ? '⚠️' : 'ℹ️'}
        </span>
        <span>{toast.text}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss message"
          className="ml-2 cursor-pointer font-bold hover:opacity-70"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
