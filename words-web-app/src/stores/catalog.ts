import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { getAllLessons } from '../features/lessons/lessons.api';
import type { Lesson } from '../features/lessons/lessons.types';
import { getAllTopics } from '../features/topics/topics.api';
import type { Topic } from '../features/topics/topics.types';
import { getAllWordAnswers } from '../features/word-answers/word-answers.api';
import type { WordAnswer } from '../features/word-answers/word-answer.types';
import { getAllWords } from '../features/words/words.api';
import type { Word } from '../features/words/words.types';
import { createIdbStorage } from '../lib/idbStorage';

export interface CatalogState {
  userId: string | null;
  topics: Topic[];
  lessons: Lesson[];
  words: Word[];
  answers: WordAnswer[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: unknown;
  load: (userId: string) => Promise<void>;
  addAnswers: (answers: WordAnswer[]) => void;
  reset: () => void;
}

type PersistedCatalog = Pick<
  CatalogState,
  'userId' | 'topics' | 'lessons' | 'words' | 'answers'
>;

const initialData = {
  userId: null,
  topics: [],
  lessons: [],
  words: [],
  answers: [],
  status: 'idle',
  error: null,
} satisfies Partial<CatalogState>;

let currentLoad = 0;

export const useCatalogStore = create<CatalogState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialData,
        load: async (userId) => {
          const { status } = get();
          if (status === 'loading' || status === 'ready') {
            return;
          }

          const loadId = ++currentLoad;
          set({ status: 'loading', error: null });
          await waitForHydration();
          if (loadId !== currentLoad) {
            return;
          }
          if (get().userId === userId) {
            set({ status: 'ready' });
            return;
          }

          set({ ...initialData, status: 'loading' });
          try {
            const [topics, lessons, words, answers] = await Promise.all([
              getAllTopics(),
              getAllLessons(),
              getAllWords(),
              getAllWordAnswers(),
            ]);
            if (loadId === currentLoad) {
              set({ userId, topics, lessons, words, answers, status: 'ready' });
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
            const added = newAnswers.filter(
              (answer) => !knownIds.has(answer.id),
            );
            return added.length > 0
              ? { answers: [...state.answers, ...added] }
              : {};
          });
        },
        reset: () => {
          currentLoad++;
          set(initialData);
        },
      }),
      {
        name: 'catalog',
        version: 1,
        storage: createIdbStorage<PersistedCatalog>(),
        partialize: ({ userId, topics, lessons, words, answers }) => ({
          userId,
          topics,
          lessons,
          words,
          answers,
        }),
      },
    ),
    { name: 'catalog', enabled: import.meta.env.DEV },
  ),
);

function waitForHydration(): Promise<void> {
  if (useCatalogStore.persist.hasHydrated()) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const unsubscribe = useCatalogStore.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
}
