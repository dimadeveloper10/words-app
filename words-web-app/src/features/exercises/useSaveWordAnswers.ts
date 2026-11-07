import { toast } from 'sonner';
import { useAnswersStore } from '../../stores/answers';
import type {
  WordAnswer,
  PendingWordAnswer,
} from '../word-answers/word-answer.types';
import {
  EXERCISE_TYPE,
  saveWordAnswers,
} from '../word-answers/word-answers.api';

function toWordAnswer(
  answer: PendingWordAnswer,
  lessonId: string,
  savedAt: string,
): WordAnswer {
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
  const addAnswers = useAnswersStore((state) => state.addAnswers);

  return function saveAnswers(answers: PendingWordAnswer[]) {
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
            .map((answer) => toWordAnswer(answer, lessonId, savedAt)),
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
