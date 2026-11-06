import { useShallow } from 'zustand/react/shallow';
import { useCatalogStore } from '../../stores/catalog';
import {
  selectAnswers,
  selectLessonAnswers,
  selectLessonPoints,
  selectWordAnswers,
} from '../../stores/catalog.selectors';

export function useWordAnswers() {
  return useCatalogStore(selectAnswers);
}

export function useLessonAnswers(lessonId: string) {
  return useCatalogStore(
    useShallow((state) => selectLessonAnswers(state, lessonId)),
  );
}

export function useWordAnswersOf(wordId: string) {
  return useCatalogStore(
    useShallow((state) => selectWordAnswers(state, wordId)),
  );
}

export function useLessonPoints(lessonId: string) {
  return useCatalogStore((state) => selectLessonPoints(state, lessonId));
}
