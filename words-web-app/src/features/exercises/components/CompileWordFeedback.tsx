import type { JSX } from 'react';
import type { AnswerStatus } from '../useCompileWordExercise';
import './CompileWordFeedback.css';

interface CompileWordFeedbackProps {
  status: AnswerStatus;
  word: string;
  answerId: string;
}

export function CompileWordFeedback({
  status,
  word,
  answerId,
}: CompileWordFeedbackProps): JSX.Element {
  return (
    <>
      <p role="status" className="visually-hidden">
        {announce(status, word)}
      </p>
      {status === 'correct' && (
        <p className="compile-word-feedback">
          <span aria-hidden="true">✓</span> Correct
        </p>
      )}
      {status === 'wrong' && (
        <p id={answerId} className="compile-word-feedback">
          {word}
        </p>
      )}
    </>
  );
}

function announce(status: AnswerStatus, word: string): string {
  switch (status) {
    case 'correct':
      return 'Correct';
    case 'wrong':
      return `Wrong. The correct word is ${word}`;
    case 'typing':
      return '';
  }
}
