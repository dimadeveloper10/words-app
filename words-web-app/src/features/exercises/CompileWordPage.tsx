import { type FormEvent, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGoBack } from '../../components/useGoBack';
import { formatTranslation } from '../words/formatTranslation';
import { useLessonWords } from '../words/useWords';
import { ExerciseHeader } from './ExerciseHeader';
import { useCompileWordExercise } from './useCompileWordExercise';
import './CompileWordPage.css';

export function CompileWordPage() {
  const { lessonId = '' } = useParams();
  const words = useLessonWords(lessonId);
  const lessonPath = `/lessons/${lessonId}`;
  const goBack = useGoBack();
  const {
    word,
    answer,
    status,
    correctCount,
    changeAnswer,
    submitAnswer,
    playAgain,
  } = useCompileWordExercise(words);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitAnswer();
  }

  function handlePlayAgain() {
    playAgain();
    inputRef.current?.focus();
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
        <section className="compile-word-footer" aria-label="Result">
          <div className="compile-word-footer-inner">
            <dl className="compile-word-stats">
              <dt>Correct answers</dt>
              <dd>{correctCount}</dd>
            </dl>
            <div className="compile-word-actions">
              <button
                type="button"
                className="auth-submit"
                onClick={handlePlayAgain}
              >
                Play again
              </button>
              <Link to={lessonPath} className="auth-submit" onClick={goBack}>
                Finish
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
