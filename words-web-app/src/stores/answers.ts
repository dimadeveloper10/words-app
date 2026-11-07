import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  getAllWordAnswers,
  saveWordAnswers,
} from '../features/word-answers/word-answers.api';
import type {
  WordAnswer,
  WordAnswerDto,
} from '../features/word-answers/word-answer.types';
import { createIdbStorage } from '../lib/idbStorage';
import { waitForHydration } from '../lib/persistHydration';
import { applyBatchResult, chunk, SYNC_CHUNK_SIZE } from './answers.sync';

export interface SyncResult {
  rejected: number;
}

export interface AnswersState {
  userId: string | null;
  answers: WordAnswer[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: unknown;
  load: (userId: string) => Promise<void>;
  enqueue: (answers: WordAnswerDto[]) => void;
  sync: () => Promise<SyncResult>;
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
let currentSync: Promise<SyncResult> | null = null;

function markSynced(answers: WordAnswerDto[]): WordAnswer[] {
  return answers.map((answer) => ({ ...answer, isSynced: true }));
}

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

async function runSync(): Promise<SyncResult> {
  const unsynced = useAnswersStore
    .getState()
    .answers.filter((answer) => !answer.isSynced);
  let rejected = 0;
  if (unsynced.length === 0 || !navigator.onLine) {
    return { rejected };
  }

  for (const batch of chunk(unsynced, SYNC_CHUNK_SIZE)) {
    try {
      const result = await saveWordAnswers(batch);
      const applied = applyBatchResult(
        useAnswersStore.getState().answers,
        result,
      );
      useAnswersStore.setState({ answers: applied.answers });
      rejected += applied.rejected;
    } catch (error) {
      console.warn('Answers sync stopped, will retry later', error);
      break;
    }
  }
  return { rejected };
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
                    answers: mergeAnswers(
                      markSynced(serverAnswers),
                      state.answers,
                    ),
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
              set({ userId, answers: markSynced(answers), status: 'ready' });
            }
          } catch (error) {
            if (loadId === currentLoad) {
              set({ status: 'error', error });
            }
          }
        },
        enqueue: (newAnswers) => {
          set((state) => {
            const knownIds = new Set(state.answers.map((answer) => answer.id));
            const added = newAnswers
              .filter((answer) => !knownIds.has(answer.id))
              .map((answer) => ({ ...answer, isSynced: false }));
            return added.length > 0
              ? { answers: [...state.answers, ...added] }
              : {};
          });
        },
        sync: () => {
          currentSync ??= runSync().finally(() => {
            currentSync = null;
          });
          return currentSync;
        },
        reset: () => {
          currentLoad++;
          set(initialData);
        },
      }),
      {
        name: 'answers',
        version: 2,
        storage: createIdbStorage<PersistedAnswers>(),
        partialize: ({ userId, answers }) => ({ userId, answers }),
        migrate: (persisted, version) => {
          if (version === 1) {
            const old = persisted as {
              userId: string | null;
              answers: WordAnswerDto[];
            };
            return { userId: old.userId, answers: markSynced(old.answers) };
          }
          return persisted as PersistedAnswers;
        },
      },
    ),
    { name: 'answers', enabled: import.meta.env.DEV },
  ),
);
