import { useShallow } from 'zustand/react/shallow';
import { useCatalogStore } from '../../stores/catalog';
import {
  selectLesson,
  selectLessons,
  selectTopicLessons,
} from '../../stores/catalog.selectors';
import type { Lesson } from './lessons.types';

export function useLessons(): Lesson[] {
  return useCatalogStore(selectLessons);
}

export function useTopicLessons(topicId: string): Lesson[] {
  return useCatalogStore(
    useShallow((state) => selectTopicLessons(state, topicId)),
  );
}

export function useLesson(id: string): Lesson | undefined {
  return useCatalogStore((state) => selectLesson(state, id));
}
