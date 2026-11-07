import { useShallow } from 'zustand/react/shallow';
import { useAnswersStore } from '../../stores/answers';
import {
  selectAnswers,
  selectLessonAnswers,
  selectLessonPoints,
  selectWordAnswers,
} from '../../stores/answers.selectors';

export function useWordAnswers() {
  return useAnswersStore(selectAnswers);
}

export function useLessonAnswers(lessonId: string) {
  return useAnswersStore(
    useShallow((state) => selectLessonAnswers(state, lessonId)),
  );
}

export function useWordAnswersOf(wordId: string) {
  return useAnswersStore(
    useShallow((state) => selectWordAnswers(state, wordId)),
  );
}

export function useLessonPoints(lessonId: string) {
  return useAnswersStore((state) => selectLessonPoints(state, lessonId));
}
