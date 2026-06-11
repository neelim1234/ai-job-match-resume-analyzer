import { useState } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ isOpen, title, message, confirmLabel = 'Delete', onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">🗑️</div>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn btn-ghost">Cancel</button>
          <button onClick={onConfirm} className="btn btn-danger-solid" id="confirm-delete-btn">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook to simplify using the confirm modal
export function useConfirm() {
  const [state, setState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    resolve: ((confirmed: boolean) => void) | null;
  }>({ isOpen: false, title: '', message: '', resolve: null });

  const confirm = (title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ isOpen: true, title, message, resolve });
    });
  };

  const handleConfirm = () => {
    state.resolve?.(true);
    setState((s) => ({ ...s, isOpen: false }));
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState((s) => ({ ...s, isOpen: false }));
  };

  return {
    confirm,
    modalProps: {
      isOpen: state.isOpen,
      title: state.title,
      message: state.message,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
  };
}
