import { type FormEvent, type MouseEvent, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { useGoBack } from '../../components/useGoBack';
import { formatTranslation } from '../words/formatTranslation';
import { useLessonWords } from '../words/useWords';
import type { Word } from '../words/words.types';
import { ExerciseHeader } from './components/ExerciseHeader';
import { FinishExerciseDialog } from './components/FinishExerciseDialog';
import { LetterPicker } from './components/LetterPicker';
import { useCompileWordExercise } from './useCompileWordExercise';
import { useSaveWordAnswers } from './useSaveWordAnswers';
import './CompileWordPage.css';

type InputMode = 'keyboard' | 'letters';

const INPUT_MODE_KEY = 'compileWord.inputMode';

function readInputMode(): InputMode {
  try {
    return localStorage.getItem(INPUT_MODE_KEY) === 'letters'
      ? 'letters'
      : 'keyboard';
  } catch {
    return 'keyboard';
  }
}

function saveInputMode(mode: InputMode) {
  try {
    localStorage.setItem(INPUT_MODE_KEY, mode);
  } catch {
    return;
  }
}

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

interface CompileWordExerciseProps {
  lessonId: string;
  words: Word[];
}

export function CompileWordPage() {
  const { lessonId = '' } = useParams();
  const words = useLessonWords(lessonId);

  if (words.length === 0) {
    return (
      <main className="session-page" aria-labelledby="compile-word-title">
        <PageHeader
          id="compile-word-title"
          title="Compile word"
          backTo={`/lessons/${lessonId}`}
        />
        <p>No words in this lesson yet.</p>
      </main>
    );
  }

  return <CompileWordExercise lessonId={lessonId} words={words} />;
}

function CompileWordExercise({ lessonId, words }: CompileWordExerciseProps) {
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [finishOpen, setFinishOpen] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>(readInputMode);
  const isLetters = inputMode === 'letters';

  function toggleInputMode() {
    const next: InputMode = isLetters ? 'keyboard' : 'letters';
    setInputMode(next);
    saveInputMode(next);
    if (next === 'keyboard') {
      inputRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitAnswer();
  }

  function handlePlayAgain() {
    saveAnswers(answers);
    setFinishOpen(false);
    playAgain();
    if (!isLetters) {
      inputRef.current?.focus();
    }
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
        actions={
          <button
            type="button"
            className="exercise-icon-button"
            aria-label="Pick letters instead of typing"
            aria-pressed={isLetters}
            disabled={answer.length > 0 || status !== 'typing'}
            onClick={toggleInputMode}
          >
            {isLetters ? lettersIcon : keyboardIcon}
          </button>
        }
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
        {status === 'wrong' && (
          <p id="compile-word-correct" className="compile-word-correct">
            {word.word}
          </p>
        )}
      </form>
      {isLetters && status === 'typing' && (
        <LetterPicker
          key={step}
          word={word.word}
          onAnswerChange={changeAnswer}
          onComplete={submitAnswer}
        />
      )}
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
