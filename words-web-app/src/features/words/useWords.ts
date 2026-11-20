import { useShallow } from 'zustand/react/shallow';
import { useCatalogStore } from '../../stores/catalog';
import {
  selectLessonWords,
  selectWord,
  selectWords,
} from '../../stores/catalog.selectors';
import type { Word } from './words.types';

export function useWords(): Word[] {
  return useCatalogStore(selectWords);
}

export function useWord(id: string): Word | undefined {
  return useCatalogStore((state) => selectWord(state, id));
}

export function useLessonWords(lessonId: string): Word[] {
  return useCatalogStore(
    useShallow((state) => selectLessonWords(state, lessonId)),
  );
}
