import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { getAllWordAnswers } from '../features/word-answers/word-answers.api';
import type { WordAnswer } from '../features/word-answers/word-answer.types';
import { createIdbStorage } from '../lib/idbStorage';
import { waitForHydration } from '../lib/persistHydration';

export interface AnswersState {
  userId: string | null;
  answers: WordAnswer[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: unknown;
  load: (userId: string) => Promise<void>;
  addAnswers: (answers: WordAnswer[]) => void;
  reset: () => void;
}

type PersistedAnswers = Pick<AnswersState, 'userId' | 'answers'>;

const initialData = {
  userId: null,
  answers: [],
  status: 'idle',
  error: null,
} satisfies Partial<AnswersState>;

let currentLoad = 0;

function mergeAnswers(
  serverAnswers: WordAnswer[],
  localAnswers: WordAnswer[],
): WordAnswer[] {
  const serverIds = new Set(serverAnswers.map((answer) => answer.id));
  return [
    ...serverAnswers,
    ...localAnswers.filter((answer) => !serverIds.has(answer.id)),
  ];
}

export const useAnswersStore = create<AnswersState>()(
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
          await waitForHydration(useAnswersStore.persist);
          if (loadId !== currentLoad) {
            return;
          }

          if (get().userId === userId) {
            set({ status: 'ready' });
            getAllWordAnswers()
              .then((serverAnswers) => {
                if (loadId === currentLoad) {
                  set((state) => ({
                    answers: mergeAnswers(serverAnswers, state.answers),
                  }));
                }
              })
              .catch((error: unknown) => {
                console.warn('Background answers refresh failed', error);
              });
            return;
          }

          set({ ...initialData, status: 'loading' });
          try {
            const answers = await getAllWordAnswers();
            if (loadId === currentLoad) {
              set({ userId, answers, status: 'ready' });
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
        name: 'answers',
        version: 1,
        storage: createIdbStorage<PersistedAnswers>(),
        partialize: ({ userId, answers }) => ({ userId, answers }),
      },
    ),
    { name: 'answers', enabled: import.meta.env.DEV },
  ),
);
