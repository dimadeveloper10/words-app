import type { AnswersState } from './answers';

export const selectAnswers = (state: AnswersState) => state.answers;

export const selectLessonAnswers = (state: AnswersState, lessonId: string) =>
  state.answers.filter((answer) => answer.lessonId === lessonId);

export const selectWordAnswers = (state: AnswersState, wordId: string) =>
  state.answers.filter((answer) => answer.wordId === wordId);

export const selectLessonPoints = (state: AnswersState, lessonId: string) =>
  selectLessonAnswers(state, lessonId).reduce(
    (sum, answer) => sum + answer.pointsAwarded,
    0,
  );

export const selectUnsyncedCount = (state: AnswersState) =>
  state.answers.filter((answer) => !answer.isSynced).length;
