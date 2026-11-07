import {
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
  useId,
} from 'react';
import { useModalDialog } from './useModalDialog';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  onCancel: () => void;
  children: ReactNode;
}

export function ConfirmDialog({
  open,
  title,
  description,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const dialogRef = useModalDialog(open);
  const titleId = useId();

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    onCancel();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
    >
      <div className="confirm-dialog-content">
        <h2 id={titleId} className="confirm-dialog-title">
          {title}
        </h2>
        {description && (
          <p className="confirm-dialog-description">{description}</p>
        )}
        <div className="confirm-dialog-actions">{children}</div>
      </div>
    </dialog>
  );
}
