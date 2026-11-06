import { api } from '../../lib/api';
import { fetchAllPages } from '../../lib/fetchAllPages';
import type {
  SavedWordAnswer,
  SaveWordAnswersResult,
  WordAnswer,
} from './word-answer.types';

export const EXERCISE_TYPE = 'compile_word';

export function getAllWordAnswers(
  signal?: AbortSignal,
): Promise<SavedWordAnswer[]> {
  return fetchAllPages<SavedWordAnswer>('/word-answers', signal);
}

export interface SaveWordAnswersInput {
  lessonId: string;
  answers: WordAnswer[];
}

export async function saveWordAnswers({
  lessonId,
  answers,
}: SaveWordAnswersInput): Promise<SaveWordAnswersResult> {
  const { data } = await api.post<SaveWordAnswersResult>(
    '/word-answers/batch',
    {
      answers: answers.map((answer) => ({
        id: answer.id,
        wordId: answer.wordId,
        lessonId,
        exerciseType: EXERCISE_TYPE,
        isCorrect: answer.isCorrect,
        pointsAwarded: answer.isCorrect ? 1 : 0,
        startedAt: answer.startedAt.toISOString(),
        answeredAt: answer.answeredAt.toISOString(),
      })),
    },
  );
  return data;
}
