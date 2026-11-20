import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAnswersStore } from '../../stores/answers';

export function syncAnswers(): void {
  void useAnswersStore
    .getState()
    .sync()
    .then(({ rejected }) => {
      if (rejected > 0) {
        toast.error(
          rejected === 1
            ? '1 answer was rejected by the server'
            : `${rejected} answers were rejected by the server`,
        );
      }
    });
}

export function useAnswersSync(): void {
  const status = useAnswersStore((state) => state.status);

  useEffect(() => {
    if (status === 'ready') {
      syncAnswers();
    }
  }, [status]);

  useEffect(() => {
    window.addEventListener('online', syncAnswers);
    return () => window.removeEventListener('online', syncAnswers);
  }, []);
}
