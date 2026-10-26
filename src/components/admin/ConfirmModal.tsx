import React, { useEffect, useRef } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      confirmBtnRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
    >
      <div className="sticker shadow-berry w-full max-w-md rounded-2xl bg-card p-6 border-[3px] border-foreground">
        <h3 id="modal-title" className="text-xl font-bold text-foreground">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-lg border-2 border-foreground/30 px-4 py-1.5 text-sm font-semibold hover:bg-muted"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            className={`cursor-pointer rounded-lg border-2 border-foreground px-4 py-1.5 text-sm font-bold shadow-ink active:translate-y-0.5 ${
              isDestructive
                ? 'bg-primary text-foreground hover:bg-primary/90'
                : 'bg-mint text-foreground hover:bg-mint/90'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
