import type {
  SaveWordAnswersResult,
  WordAnswer,
} from '../features/word-answers/word-answer.types';

export const SYNC_CHUNK_SIZE = 200;

export function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function applyBatchResult(
  answers: WordAnswer[],
  { savedIds, failed }: SaveWordAnswersResult,
): { answers: WordAnswer[]; rejected: number } {
  const saved = new Set(savedIds);
  const rejected = new Set(
    failed
      .filter((item) => item.statusCode >= 400 && item.statusCode < 500)
      .map((item) => item.id),
  );
  return {
    answers: answers
      .filter((answer) => !rejected.has(answer.id))
      .map((answer) =>
        !answer.isSynced && saved.has(answer.id)
          ? { ...answer, isSynced: true }
          : answer,
      ),
    rejected: rejected.size,
  };
}
