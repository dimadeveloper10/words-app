import { useShallow } from 'zustand/react/shallow';
import { useCatalogStore } from '../../stores/catalog';
import {
  selectAnswers,
  selectLessonAnswers,
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
