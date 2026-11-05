import { type FormEvent, type MouseEvent, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGoBack } from '../../components/useGoBack';
import { formatTranslation } from '../words/formatTranslation';
import { useLessonWords } from '../words/useWords';
import { ExerciseHeader } from './ExerciseHeader';
import { FinishExerciseDialog } from './FinishExerciseDialog';
import { useCompileWordExercise } from './useCompileWordExercise';
import { useSaveWordAnswers } from './useSaveWordAnswers';
import './CompileWordPage.css';

export function CompileWordPage() {
  const { lessonId = '' } = useParams();
  const words = useLessonWords(lessonId);
  const lessonPath = `/lessons/${lessonId}`;
  const goBack = useGoBack();
  const {
    word,
    answer,
    answers,
    status,
    correctCount,
    changeAnswer,
    submitAnswer,
    playAgain,
  } = useCompileWordExercise(words);
  const saveAnswers = useSaveWordAnswers(lessonId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [finishOpen, setFinishOpen] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitAnswer();
  }

  function handlePlayAgain() {
    saveAnswers(answers);
    setFinishOpen(false);
    playAgain();
    inputRef.current?.focus();
  }

  function handleFinish(event: MouseEvent<HTMLAnchorElement>) {
    saveAnswers(answers);
    goBack(event);
  }

  return (
    <main
      className="session-page compile-word-page"
      aria-labelledby="compile-word-title"
    >
      <ExerciseHeader
        id="compile-word-title"
        title={String(correctCount)}
        closeTo={lessonPath}
        confirmClose={answers.length > 0}
        onConfirmClose={() => saveAnswers(answers)}
      />
      <form className="compile-word-body" onSubmit={handleSubmit}>
        <p id="compile-word-prompt" className="compile-word-translation">
          {formatTranslation(word)}
        </p>
        <input
          ref={inputRef}
          className={`compile-word-input compile-word-input-${status}`}
          aria-labelledby="compile-word-prompt"
          aria-invalid={status === 'wrong'}
          aria-describedby={
            status === 'wrong' ? 'compile-word-correct' : undefined
          }
          value={answer}
          readOnly={status !== 'typing'}
          onChange={(event) => changeAnswer(event.target.value)}
          autoFocus
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
        />
        {status === 'wrong' && (
          <p id="compile-word-correct" className="compile-word-correct">
            {word.word}
          </p>
        )}
      </form>
      {status === 'wrong' && (
        <div className="compile-word-footer">
          <div className="compile-word-footer-inner">
            <button
              type="button"
              className="auth-submit compile-word-continue"
              autoFocus
              onClick={() => setFinishOpen(true)}
            >
              Continue
            </button>
          </div>
        </div>
      )}
      <FinishExerciseDialog
        open={finishOpen}
        correctCount={correctCount}
        finishTo={lessonPath}
        onFinish={handleFinish}
        onPlayAgain={handlePlayAgain}
      />
    </main>
  );
}
