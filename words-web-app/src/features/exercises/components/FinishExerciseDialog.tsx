import type { JSX, MouseEvent, SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import { useModalDialog } from '../../../components/useModalDialog';
import './FinishExerciseDialog.css';

interface FinishExerciseDialogProps {
  open: boolean;
  correctCount: number;
  finishTo: string;
  onFinish: (event: MouseEvent<HTMLAnchorElement>) => void;
  onPlayAgain: () => void;
}

export function FinishExerciseDialog({
  open,
  correctCount,
  finishTo,
  onFinish,
  onPlayAgain,
}: FinishExerciseDialogProps): JSX.Element {
  const dialogRef = useModalDialog(open);

  function preventDismiss(event: SyntheticEvent<HTMLDialogElement>): void {
    event.preventDefault();
  }

  return (
    <dialog
      ref={dialogRef}
      className="finish-exercise-dialog"
      aria-label="Exercise results"
      onCancel={preventDismiss}
    >
      <div className="finish-exercise-dialog__content">
        <dl className="finish-exercise-dialog__stats">
          <dt className="finish-exercise-dialog__stat-label">
            Correct answers
          </dt>
          <dd className="finish-exercise-dialog__stat-value">{correctCount}</dd>
        </dl>
        <div className="finish-exercise-dialog__actions">
          <Link
            to={finishTo}
            className="button button--secondary"
            onClick={onFinish}
          >
            Finish
          </Link>
          <button
            type="button"
            className="button button--primary"
            autoFocus
            onClick={onPlayAgain}
          >
            Play again
          </button>
        </div>
      </div>
    </dialog>
  );
}
