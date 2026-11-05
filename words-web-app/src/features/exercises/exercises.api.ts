import { api } from '../../lib/api';
import type { SaveWordAnswersResult, WordAnswer } from './exercises.types';

const EXERCISE_TYPE = 'compile_word';

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
