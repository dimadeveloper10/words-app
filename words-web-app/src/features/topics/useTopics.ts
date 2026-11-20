import { useCatalogStore } from '../../stores/catalog';
import { selectTopic, selectTopics } from '../../stores/catalog.selectors';
import type { Topic } from './topics.types';

export function useTopics(): Topic[] {
  return useCatalogStore(selectTopics);
}

export function useTopic(id: string): Topic | undefined {
  return useCatalogStore((state) => selectTopic(state, id));
}
