import {
  type JSX,
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
}: ConfirmDialogProps): JSX.Element {
  const dialogRef = useModalDialog(open);
  const titleId = useId();

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>): void {
    event.preventDefault();
    onCancel();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>): void {
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
      <div className="confirm-dialog__content">
        <h2 id={titleId} className="confirm-dialog__title">
          {title}
        </h2>
        {description && (
          <p className="confirm-dialog__description">{description}</p>
        )}
        <div className="confirm-dialog__actions">{children}</div>
      </div>
    </dialog>
  );
}
