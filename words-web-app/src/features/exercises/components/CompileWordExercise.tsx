import {
  type FormEvent,
  type JSX,
  type MouseEvent,
  useRef,
  useState,
} from 'react';
import { useGoBack } from '../../../components/useGoBack';
import { formatTranslation } from '../../words/formatTranslation';
import type { Word } from '../../words/words.types';
import { useCompileWordExercise } from '../useCompileWordExercise';
import { useInputMode } from '../useInputMode';
import { useSaveWordAnswers } from '../useSaveWordAnswers';
import { CompileWordFeedback } from './CompileWordFeedback';
import { ExerciseHeader } from './ExerciseHeader';
import { FinishExerciseDialog } from './FinishExerciseDialog';
import { LetterPicker } from './LetterPicker';
import './CompileWordExercise.css';

interface CompileWordExerciseProps {
  lessonId: string;
  words: Word[];
}

const TITLE_ID = 'compile-word-title';
const PROMPT_ID = 'compile-word-prompt';
const ANSWER_ID = 'compile-word-answer';

const iconProps = {
  'aria-hidden': true,
  viewBox: '0 0 24 24',
  width: 22,
  height: 22,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const keyboardIcon = (
  <svg {...iconProps}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M18 13h.01M10 13h4M8 16h8" />
  </svg>
);

const lettersIcon = (
  <svg {...iconProps}>
    <rect x="2" y="7" width="9" height="10" rx="2" />
    <rect x="13" y="7" width="9" height="10" rx="2" />
    <path d="m4.5 15 2-6 2 6M5.2 13h2.6M15.5 9v6h1.8a1.5 1.5 0 0 0 0-3h-1.8m0 0h1.5a1.5 1.5 0 0 0 0-3h-1.5" />
  </svg>
);

export function CompileWordExercise({
  lessonId,
  words,
}: CompileWordExerciseProps): JSX.Element {
  const lessonPath = `/lessons/${lessonId}`;
  const goBack = useGoBack();
  const {
    word,
    step,
    answer,
    answers,
    status,
    correctCount,
    changeAnswer,
    submitAnswer,
    playAgain,
  } = useCompileWordExercise(words);
  const saveAnswers = useSaveWordAnswers(lessonId);
  const { isLetters, toggleInputMode } = useInputMode();
  const inputRef = useRef<HTMLInputElement>(null);
  const [finishOpen, setFinishOpen] = useState(false);
  const showPicker = isLetters && status === 'typing';
  const showFooter = status === 'wrong';

  function handleToggleInputMode(): void {
    toggleInputMode();
    if (isLetters) {
      inputRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    submitAnswer();
  }

  function handlePlayAgain(): void {
    saveAnswers(answers);
    setFinishOpen(false);
    playAgain();
    if (!isLetters) {
      inputRef.current?.focus();
    }
  }

  function handleFinish(event: MouseEvent<HTMLAnchorElement>): void {
    saveAnswers(answers);
    goBack(event);
  }

  return (
    <main
      className={pageClassName(showPicker, showFooter)}
      aria-labelledby={TITLE_ID}
    >
      <ExerciseHeader
        id={TITLE_ID}
        title={String(correctCount)}
        closeTo={lessonPath}
        confirmClose={answers.length > 0}
        onConfirmClose={() => saveAnswers(answers)}
        actions={
          <button
            type="button"
            className="icon-button"
            aria-label="Pick letters instead of typing"
            aria-pressed={isLetters}
            disabled={answer.length > 0 || status !== 'typing'}
            onClick={handleToggleInputMode}
          >
            {isLetters ? lettersIcon : keyboardIcon}
          </button>
        }
      />
      <form className="compile-word-exercise__body" onSubmit={handleSubmit}>
        <p id={PROMPT_ID} className="compile-word-exercise__translation">
          {formatTranslation(word)}
        </p>
        <input
          ref={inputRef}
          className={`compile-word-exercise__input compile-word-exercise__input--${status}`}
          aria-labelledby={PROMPT_ID}
          aria-invalid={status === 'wrong'}
          aria-describedby={status === 'wrong' ? ANSWER_ID : undefined}
          value={answer}
          readOnly={isLetters || status !== 'typing'}
          inputMode={isLetters ? 'none' : undefined}
          tabIndex={isLetters ? -1 : undefined}
          onChange={(event) => changeAnswer(event.target.value)}
          autoFocus={!isLetters}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
        />
        <CompileWordFeedback
          status={status}
          word={word.word}
          answerId={ANSWER_ID}
        />
      </form>
      {showPicker && (
        <LetterPicker
          key={step}
          word={word.word}
          onAnswerChange={changeAnswer}
          onComplete={submitAnswer}
        />
      )}
      {showFooter && (
        <div className="compile-word-exercise__footer">
          <div className="compile-word-exercise__footer-inner">
            <button
              type="button"
              className="button button--primary compile-word-exercise__continue"
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

function pageClassName(showPicker: boolean, showFooter: boolean): string {
  return [
    'page',
    'compile-word-exercise',
    showPicker && 'compile-word-exercise--with-picker',
    showFooter && 'compile-word-exercise--with-footer',
  ]
    .filter(Boolean)
    .join(' ');
}
