import { useEffect, useRef, useState } from 'react';
import { speakWord, stopSpeaking } from '../words/speakWord';
import type { Word } from '../words/words.types';
import type { WordAnswer } from './exercises.types';

const START_DELAY_MS = 2000;
const NEXT_WORD_DELAY_MS = 1000;

export type AnswerStatus = 'typing' | 'correct' | 'wrong';

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function useCompileWordExercise(words: Word[]) {
  const [word, setWord] = useState(() => pickRandom(words));
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<WordAnswer[]>([]);
  const [status, setStatus] = useState<AnswerStatus>('typing');
  const startedAt = useRef<Date | null>(null);
  const correctCount = answers.filter((a) => a.isCorrect).length;

  useEffect(() => {
    const timer = setTimeout(() => {
      startedAt.current ??= new Date();
    }, START_DELAY_MS);
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (status !== 'correct') return;
    const timer = setTimeout(() => {
      startedAt.current = null;
      setWord(pickRandom(words));
      setStep((s) => s + 1);
      setAnswer('');
      setStatus('typing');
    }, NEXT_WORD_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status, words]);

  useEffect(() => stopSpeaking, []);

  function changeAnswer(value: string) {
    if (status !== 'typing') return;
    startedAt.current ??= new Date();
    setAnswer(value);
  }

  function submitAnswer() {
    if (status !== 'typing' || normalize(answer) === '') return;

    const isCorrect = normalize(answer) === normalize(word.word);
    const answeredAt = new Date();
    setAnswers((prev) => [
      ...prev,
      {
        wordId: word.id,
        startedAt: startedAt.current ?? answeredAt,
        answeredAt,
        isCorrect,
      },
    ]);
    setStatus(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) speakWord(word.word);
  }

  function playAgain() {
    startedAt.current = null;
    setWord(pickRandom(words));
    setStep((s) => s + 1);
    setAnswer('');
    setAnswers([]);
    setStatus('typing');
  }

  return {
    word,
    answer,
    answers,
    status,
    correctCount,
    changeAnswer,
    submitAnswer,
    playAgain,
  };
}
