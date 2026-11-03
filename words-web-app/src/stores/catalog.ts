import { create } from 'zustand';
import { getAllLessons } from '../features/lessons/lessons.api';
import type { Lesson } from '../features/lessons/lessons.types';
import { getAllTopics } from '../features/topics/topics.api';
import type { Topic } from '../features/topics/topics.types';
import { getAllWords } from '../features/words/words.api';
import type { Word } from '../features/words/words.types';

export interface CatalogState {
  topics: Topic[];
  lessons: Lesson[];
  wordsById: Record<string, Word>;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: unknown;
  load: () => Promise<void>;
  reset: () => void;
}

const initialData = {
  topics: [],
  lessons: [],
  wordsById: {},
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
      const [topics, lessons, words] = await Promise.all([
        getAllTopics(),
        getAllLessons(),
        getAllWords(),
      ]);
      if (loadId === currentLoad) {
        const wordsById = Object.fromEntries(
          words.map((word) => [word.id, word]),
        );
        set({ topics, lessons, wordsById, status: 'ready' });
      }
    } catch (error) {
      if (loadId === currentLoad) set({ status: 'error', error });
    }
  },
  reset: () => {
    currentLoad++;
    set(initialData);
  },
}));
