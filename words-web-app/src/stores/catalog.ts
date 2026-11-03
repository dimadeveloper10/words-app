import { create } from 'zustand';
import { getAllLessons } from '../features/lessons/lessons.api';
import type { Lesson } from '../features/lessons/lessons.types';
import { getAllTopics } from '../features/topics/topics.api';
import type { Topic } from '../features/topics/topics.types';

export interface CatalogState {
  topics: Topic[];
  lessons: Lesson[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: unknown;
  load: () => Promise<void>;
  reset: () => void;
}

const initialData = {
  topics: [],
  lessons: [],
  status: 'idle',
  error: null,
} satisfies Partial<CatalogState>;

let currentLoad = 0;

export const useCatalogStore = create<CatalogState>()((set, get) => ({
  ...initialData,
  load: async () => {
    const { status } = get();
    if (status === 'loading' || status === 'ready') return;

    const loadId = ++currentLoad;
    set({ status: 'loading', error: null });
    try {
      const [topics, lessons] = await Promise.all([
        getAllTopics(),
        getAllLessons(),
      ]);
      if (loadId === currentLoad) set({ topics, lessons, status: 'ready' });
    } catch (error) {
      if (loadId === currentLoad) set({ status: 'error', error });
    }
  },
  reset: () => {
    currentLoad++;
    set(initialData);
  },
}));
