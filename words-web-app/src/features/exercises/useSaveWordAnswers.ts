import { toast } from 'sonner';
import { useCatalogStore } from '../../stores/catalog';
import type {
  SavedWordAnswer,
  WordAnswer,
} from '../word-answers/word-answer.types';
import {
  EXERCISE_TYPE,
  saveWordAnswers,
} from '../word-answers/word-answers.api';

function toSavedAnswer(
  answer: WordAnswer,
  lessonId: string,
  savedAt: string,
): SavedWordAnswer {
  return {
    id: answer.id,
    wordId: answer.wordId,
    lessonId,
    exerciseType: EXERCISE_TYPE,
    isCorrect: answer.isCorrect,
    pointsAwarded: answer.isCorrect ? 1 : 0,
    startedAt: answer.startedAt.toISOString(),
    answeredAt: answer.answeredAt.toISOString(),
    createdAt: savedAt,
  };
}

export function useSaveWordAnswers(lessonId: string) {
  const addAnswers = useCatalogStore((state) => state.addAnswers);

  return function saveAnswers(answers: WordAnswer[]) {
    if (answers.length === 0) {
      return;
    }
    saveWordAnswers({ lessonId, answers })
      .then(({ savedIds, failed }) => {
        const saved = new Set(savedIds);
        const savedAt = new Date().toISOString();
        addAnswers(
          answers
            .filter((answer) => saved.has(answer.id))
            .map((answer) => toSavedAnswer(answer, lessonId, savedAt)),
        );
        if (failed.length > 0) {
          toast.error('Some answers were rejected');
        }
      })
      .catch(() => {
        toast.error('Something went wrong. Your answers were not saved.');
      });
  };
}
