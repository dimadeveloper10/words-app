import { toast } from 'sonner';
import { saveWordAnswers } from './exercises.api';
import type { WordAnswer } from './exercises.types';

export function useSaveWordAnswers(lessonId: string) {
  return function saveAnswers(answers: WordAnswer[]) {
    if (answers.length === 0) return;
    saveWordAnswers({ lessonId, answers })
      .then(({ failed }) => {
        if (failed.length > 0) toast.error('Some answers were rejected');
      })
      .catch(() => {
        toast.error('Something went wrong. Your answers were not saved.');
      });
  };
}
