import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { speakWord, stopSpeaking } from '../words/speakWord';
import type { Word } from '../words/words.types';
import type { PendingWordAnswer } from '../word-answers/word-answer.types';

const START_DELAY_MS = 2000;
const NEXT_WORD_DELAY_MS = 1500;

export type AnswerStatus = 'typing' | 'correct' | 'wrong';

type Round = ReturnType<typeof useRound>;

type AnswerInput = {
  answer: string;
  changeAnswer: (value: string) => void;
  getStartedAt: () => Date | null;
  reset: () => void;
};

type AnswerLog = {
  answers: PendingWordAnswer[];
  submitAnswer: (value?: string) => void;
  clear: () => void;
};

export type CompileWordExerciseState = {
  word: Word;
  step: number;
  answer: string;
  answers: PendingWordAnswer[];
  status: AnswerStatus;
  correctCount: number;
  changeAnswer: (value: string) => void;
  submitAnswer: (value?: string) => void;
  playAgain: () => void;
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function createPendingAnswer(
  wordId: string,
  startedAt: Date | null,
  isCorrect: boolean,
): PendingWordAnswer {
  const answeredAt = new Date();
  return {
    id: crypto.randomUUID(),
    wordId,
    startedAt: startedAt ?? answeredAt,
    answeredAt,
    isCorrect,
  };
}

function useAnswerTimer(step: number): RefObject<Date | null> {
  const startedAt = useRef<Date | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      startedAt.current ??= new Date();
    }, START_DELAY_MS);
    return () => clearTimeout(timer);
  }, [step]);

  return startedAt;
}

function useAutoAdvance(status: AnswerStatus, nextWord: () => void): void {
  useEffect(() => {
    if (status !== 'correct') {
      return;
    }
    const timer = setTimeout(nextWord, NEXT_WORD_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status, nextWord]);
}

function useAnswerInput(step: number, status: AnswerStatus): AnswerInput {
  const [answer, setAnswer] = useState('');
  const startedAt = useAnswerTimer(step);

  const reset = useCallback(() => {
    startedAt.current = null;
    setAnswer('');
  }, [startedAt]);

  function changeAnswer(value: string): void {
    if (status === 'typing') {
      startedAt.current ??= new Date();
      setAnswer(value);
    }
  }

  function getStartedAt(): Date | null {
    return startedAt.current;
  }

  return { answer, changeAnswer, getStartedAt, reset };
}

function useRound(words: Word[]): Omit<AnswerInput, 'reset'> & {
  word: Word;
  step: number;
  status: AnswerStatus;
  markAnswered: (isCorrect: boolean) => void;
  nextWord: () => void;
} {
  const [word, setWord] = useState(() => pickRandom(words));
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<AnswerStatus>('typing');
  const { reset, ...input } = useAnswerInput(step, status);

  const nextWord = useCallback(() => {
    reset();
    setWord(pickRandom(words));
    setStep((s) => s + 1);
    setStatus('typing');
  }, [words, reset]);

  useAutoAdvance(status, nextWord);

  function markAnswered(isCorrect: boolean): void {
    setStatus(isCorrect ? 'correct' : 'wrong');
  }

  return { ...input, word, step, status, markAnswered, nextWord };
}

function useAnswerLog(round: Round): AnswerLog {
  const [answers, setAnswers] = useState<PendingWordAnswer[]>([]);
  const answeredStep = useRef<number | null>(null);

  function submitAnswer(value: string = round.answer): void {
    const { word, status, step } = round;
    if (
      status !== 'typing' ||
      normalize(value) === '' ||
      answeredStep.current === step
    ) {
      return;
    }
    answeredStep.current = step;

    const isCorrect = normalize(value) === normalize(word.word);
    setAnswers((prev) => [
      ...prev,
      createPendingAnswer(word.id, round.getStartedAt(), isCorrect),
    ]);
    round.markAnswered(isCorrect);
    if (isCorrect) {
      speakWord(word.word);
    }
  }

  return { answers, submitAnswer, clear: () => setAnswers([]) };
}

export function useCompileWordExercise(
  words: Word[],
): CompileWordExerciseState {
  const round = useRound(words);
  const log = useAnswerLog(round);

  useEffect(() => stopSpeaking, []);

  function playAgain(): void {
    round.nextWord();
    log.clear();
  }

  return {
    word: round.word,
    step: round.step,
    answer: round.answer,
    answers: log.answers,
    status: round.status,
    correctCount: log.answers.filter((a) => a.isCorrect).length,
    changeAnswer: round.changeAnswer,
    submitAnswer: log.submitAnswer,
    playAgain,
  };
}
