import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { getAllLessons } from '../features/lessons/lessons.api';
import type { Lesson } from '../features/lessons/lessons.types';
import { getAllTopics } from '../features/topics/topics.api';
import type { Topic } from '../features/topics/topics.types';
import { getAllWords } from '../features/words/words.api';
import type { Word } from '../features/words/words.types';
import { createIdbStorage } from '../lib/idbStorage';
import { waitForHydration } from '../lib/persistHydration';

export interface CatalogState {
  topics: Topic[];
  lessons: Lesson[];
  words: Word[];
  syncedAt: string | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: unknown;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
}

type PersistedCatalog = Pick<
  CatalogState,
  'topics' | 'lessons' | 'words' | 'syncedAt'
>;

let currentRefresh: Promise<void> | null = null;

export const useCatalogStore = create<CatalogState>()(
  devtools(
    persist(
      (set, get) => ({
        topics: [],
        lessons: [],
        words: [],
        syncedAt: null,
        status: 'idle',
        error: null,
        load: async () => {
          const { status } = get();
          if (status === 'loading' || status === 'ready') {
            return;
          }

          set({ status: 'loading', error: null });
          await waitForHydration(useCatalogStore.persist);

          if (get().syncedAt !== null) {
            set({ status: 'ready' });
            void get()
              .refresh()
              .catch((error: unknown) => {
                console.warn('Background catalog refresh failed', error);
              });
            return;
          }

          try {
            await get().refresh();
            set({ status: 'ready' });
          } catch (error) {
            set({ status: 'error', error });
          }
        },
        refresh: () => {
          currentRefresh ??= Promise.all([
            getAllTopics(),
            getAllLessons(),
            getAllWords(),
          ])
            .then(([topics, lessons, words]) => {
              set({
                topics,
                lessons,
                words,
                syncedAt: new Date().toISOString(),
              });
            })
            .finally(() => {
              currentRefresh = null;
            });
          return currentRefresh;
        },
      }),
      {
        name: 'catalog',
        version: 2,
        storage: createIdbStorage<PersistedCatalog>(),
        partialize: ({ topics, lessons, words, syncedAt }) => ({
          topics,
          lessons,
          words,
          syncedAt,
        }),
        migrate: (persisted, version) => {
          if (version === 1) {
            const old = persisted as PersistedCatalog & {
              userId: string | null;
            };
            return {
              topics: old.topics,
              lessons: old.lessons,
              words: old.words,
              syncedAt: old.userId ? new Date(0).toISOString() : null,
            };
          }
          return persisted as PersistedCatalog;
        },
      },
    ),
    { name: 'catalog', enabled: import.meta.env.DEV },
  ),
);
