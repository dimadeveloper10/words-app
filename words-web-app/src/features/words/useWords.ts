import { useShallow } from 'zustand/react/shallow';
import { useCatalogStore } from '../../stores/catalog';
import { selectLessonWords, selectWord } from '../../stores/catalog.selectors';

export function useWord(id: string) {
  return useCatalogStore((state) => selectWord(state, id));
}

export function useLessonWords(lessonId: string) {
  return useCatalogStore(
    useShallow((state) => selectLessonWords(state, lessonId)),
  );
}
