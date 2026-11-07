import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth';
import { useAnswersStore } from '../../stores/answers';

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    useAuthStore.getState().clear();
    useAnswersStore.getState().reset();
    queryClient.clear();
  };
}
