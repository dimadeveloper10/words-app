import { api } from '../../lib/api';
import { fetchAllPages } from '../../lib/fetchAllPages';
import type { WordAnswerDto, SaveWordAnswersResult } from './word-answer.types';

export const EXERCISE_TYPE = 'compile_word';

export function getAllWordAnswers(
  signal?: AbortSignal,
): Promise<WordAnswerDto[]> {
  return fetchAllPages<WordAnswerDto>('/word-answers', signal);
}

export async function saveWordAnswers(
  answers: WordAnswerDto[],
): Promise<SaveWordAnswersResult> {
  const { data } = await api.post<SaveWordAnswersResult>(
    '/word-answers/batch',
    {
      answers: answers.map((answer) => ({
        id: answer.id,
        wordId: answer.wordId,
        lessonId: answer.lessonId,
        exerciseType: answer.exerciseType,
        isCorrect: answer.isCorrect,
        pointsAwarded: answer.pointsAwarded,
        startedAt: answer.startedAt,
        answeredAt: answer.answeredAt,
      })),
    },
  );
  return data;
}
