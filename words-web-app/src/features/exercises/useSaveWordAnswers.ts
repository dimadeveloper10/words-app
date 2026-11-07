import { useAnswersStore } from '../../stores/answers';
import { syncAnswers } from '../word-answers/useAnswersSync';
import type {
  PendingWordAnswer,
  WordAnswerDto,
} from '../word-answers/word-answer.types';
import { EXERCISE_TYPE } from '../word-answers/word-answers.api';

function toWordAnswerDto(
  answer: PendingWordAnswer,
  lessonId: string,
): WordAnswerDto {
  return {
    id: answer.id,
    wordId: answer.wordId,
    lessonId,
    exerciseType: EXERCISE_TYPE,
    isCorrect: answer.isCorrect,
    pointsAwarded: answer.isCorrect ? 1 : 0,
    startedAt: answer.startedAt.toISOString(),
    answeredAt: answer.answeredAt.toISOString(),
  };
}

export function useSaveWordAnswers(lessonId: string) {
  const enqueue = useAnswersStore((state) => state.enqueue);

  return function saveAnswers(answers: PendingWordAnswer[]) {
    if (answers.length === 0) {
      return;
    }
    enqueue(answers.map((answer) => toWordAnswerDto(answer, lessonId)));
    syncAnswers();
  };
}
