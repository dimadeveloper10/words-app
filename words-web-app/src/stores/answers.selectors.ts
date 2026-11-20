import type { AnswersState } from './answers';
import type { WordAnswer } from '../features/word-answers/word-answer.types';

export const selectAnswers = (state: AnswersState): WordAnswer[] =>
  state.answers;

export const selectLessonAnswers = (
  state: AnswersState,
  lessonId: string,
): WordAnswer[] =>
  state.answers.filter((answer) => answer.lessonId === lessonId);

export const selectWordAnswers = (
  state: AnswersState,
  wordId: string,
): WordAnswer[] => state.answers.filter((answer) => answer.wordId === wordId);

export const selectLessonPoints = (
  state: AnswersState,
  lessonId: string,
): number =>
  selectLessonAnswers(state, lessonId).reduce(
    (sum, answer) => sum + answer.pointsAwarded,
    0,
  );

export const selectUnsyncedCount = (state: AnswersState): number =>
  state.answers.filter((answer) => !answer.isSynced).length;
