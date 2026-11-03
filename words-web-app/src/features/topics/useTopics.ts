import { useCatalogStore } from '../../stores/catalog';
import { selectTopic, selectTopics } from '../../stores/catalog.selectors';

export function useTopics() {
  return useCatalogStore(selectTopics);
}

export function useTopic(id: string) {
  return useCatalogStore((state) => selectTopic(state, id));
}
