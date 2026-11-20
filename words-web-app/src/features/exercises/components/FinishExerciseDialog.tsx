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
      <div className="finish-exercise-content">
        <dl className="finish-exercise-stats">
          <dt>Correct answers</dt>
          <dd>{correctCount}</dd>
        </dl>
        <div className="finish-exercise-actions">
          <Link
            to={finishTo}
            className="finish-exercise-finish"
            onClick={onFinish}
          >
            Finish
          </Link>
          <button
            type="button"
            className="auth-submit"
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
