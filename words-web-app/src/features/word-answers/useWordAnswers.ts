import { useShallow } from 'zustand/react/shallow';
import { useAnswersStore } from '../../stores/answers';
import {
  selectAnswers,
  selectLessonAnswers,
  selectLessonPoints,
  selectUnsyncedCount,
  selectWordAnswers,
} from '../../stores/answers.selectors';
import type { WordAnswer } from './word-answer.types';

export function useWordAnswers(): WordAnswer[] {
  return useAnswersStore(selectAnswers);
}

export function useLessonAnswers(lessonId: string): WordAnswer[] {
  return useAnswersStore(
    useShallow((state) => selectLessonAnswers(state, lessonId)),
  );
}

export function useWordAnswersOf(wordId: string): WordAnswer[] {
  return useAnswersStore(
    useShallow((state) => selectWordAnswers(state, wordId)),
  );
}

export function useLessonPoints(lessonId: string): number {
  return useAnswersStore((state) => selectLessonPoints(state, lessonId));
}

export function useUnsyncedAnswersCount(): number {
  return useAnswersStore(selectUnsyncedCount);
}
