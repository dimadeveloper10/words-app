import { create } from 'zustand';
import { getAllLessons } from '../features/lessons/lessons.api';
import type { Lesson } from '../features/lessons/lessons.types';
import { getAllTopics } from '../features/topics/topics.api';
import type { Topic } from '../features/topics/topics.types';
import { getAllWordAnswers } from '../features/word-answers/word-answers.api';
import type { WordAnswer } from '../features/word-answers/word-answer.types';
import { getAllWords } from '../features/words/words.api';
import type { Word } from '../features/words/words.types';

export interface CatalogState {
  topics: Topic[];
  lessons: Lesson[];
  wordsById: Record<string, Word>;
  answers: WordAnswer[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: unknown;
  load: () => Promise<void>;
  addAnswers: (answers: WordAnswer[]) => void;
  reset: () => void;
}

const initialData = {
  topics: [],
  lessons: [],
  wordsById: {},
  answers: [],
  status: 'idle',
  error: null,
} satisfies Partial<CatalogState>;

let currentLoad = 0;

export const useCatalogStore = create<CatalogState>()((set, get) => ({
  ...initialData,
  load: async () => {
    const { status } = get();
    if (status === 'loading' || status === 'ready') {
      return;
    }

    const loadId = ++currentLoad;
    set({ status: 'loading', error: null });
    try {
      const [topics, lessons, words, answers] = await Promise.all([
        getAllTopics(),
        getAllLessons(),
        getAllWords(),
        getAllWordAnswers(),
      ]);
      if (loadId === currentLoad) {
        const wordsById = Object.fromEntries(
          words.map((word) => [word.id, word]),
        );
        set({ topics, lessons, wordsById, answers, status: 'ready' });
      }
    } catch (error) {
      if (loadId === currentLoad) {
        set({ status: 'error', error });
      }
    }
  },
  addAnswers: (newAnswers) => {
    set((state) => {
      const knownIds = new Set(state.answers.map((answer) => answer.id));
      const added = newAnswers.filter((answer) => !knownIds.has(answer.id));
      return added.length > 0 ? { answers: [...state.answers, ...added] } : {};
    });
  },
  reset: () => {
    currentLoad++;
    set(initialData);
  },
}));
