import { type JSX, type ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { useGoBack } from '../../../components/useGoBack';
import './ExerciseHeader.css';

interface ExerciseHeaderProps {
  id: string;
  title: string;
  closeTo: string;
  confirmClose: boolean;
  onConfirmClose: () => void;
  actions?: ReactNode;
}

const closeIcon = (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export function ExerciseHeader({
  id,
  title,
  closeTo,
  confirmClose,
  onConfirmClose,
  actions,
}: ExerciseHeaderProps): JSX.Element {
  const goBack = useGoBack();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <header className="exercise-header">
      {confirmClose ? (
        <button
          type="button"
          className="icon-button"
          aria-label="Close exercise"
          aria-haspopup="dialog"
          onClick={() => setConfirmOpen(true)}
        >
          {closeIcon}
        </button>
      ) : (
        <Link
          to={closeTo}
          className="icon-button"
          aria-label="Close exercise"
          onClick={goBack}
        >
          {closeIcon}
        </Link>
      )}
      <h1 id={id} className="exercise-header__title">
        {title}
      </h1>
      {actions && <div className="exercise-header__actions">{actions}</div>}
      <ConfirmDialog
        open={confirmOpen}
        title="Are you sure you want to close the exercise?"
        onCancel={() => setConfirmOpen(false)}
      >
        <button
          type="button"
          className="button button--primary"
          autoFocus
          onClick={() => setConfirmOpen(false)}
        >
          Resume
        </button>
        <Link
          to={closeTo}
          className="button button--secondary"
          onClick={(event) => {
            onConfirmClose();
            goBack(event);
          }}
        >
          Close
        </Link>
      </ConfirmDialog>
    </header>
  );
}
