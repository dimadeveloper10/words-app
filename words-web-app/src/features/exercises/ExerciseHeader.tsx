import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useGoBack } from '../../components/useGoBack';
import './ExerciseHeader.css';

interface ExerciseHeaderProps {
  id: string;
  title: string;
  closeTo: string;
  confirmClose: boolean;
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
}: ExerciseHeaderProps) {
  const goBack = useGoBack();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <header className="exercise-header">
      {confirmClose ? (
        <button
          type="button"
          className="exercise-close"
          aria-label="Close exercise"
          aria-haspopup="dialog"
          onClick={() => setConfirmOpen(true)}
        >
          {closeIcon}
        </button>
      ) : (
        <Link
          to={closeTo}
          className="exercise-close"
          aria-label="Close exercise"
          onClick={goBack}
        >
          {closeIcon}
        </Link>
      )}
      <h1 id={id} className="exercise-title">
        {title}
      </h1>
      <ConfirmDialog
        open={confirmOpen}
        title="Are you sure you want to close the exercise?"
        onCancel={() => setConfirmOpen(false)}
      >
        <button
          type="button"
          className="auth-submit"
          autoFocus
          onClick={() => setConfirmOpen(false)}
        >
          Resume
        </button>
        <Link
          to={closeTo}
          className="confirm-dialog-secondary"
          onClick={goBack}
        >
          Close
        </Link>
      </ConfirmDialog>
    </header>
  );
}
