import { useShallow } from 'zustand/react/shallow';
import { useCatalogStore } from '../../stores/catalog';
import {
  selectLesson,
  selectLessons,
  selectTopicLessons,
} from '../../stores/catalog.selectors';

export function useLessons() {
  return useCatalogStore(selectLessons);
}

export function useTopicLessons(topicId: string) {
  return useCatalogStore(
    useShallow((state) => selectTopicLessons(state, topicId)),
  );
}

export function useLesson(id: string) {
  return useCatalogStore((state) => selectLesson(state, id));
}
