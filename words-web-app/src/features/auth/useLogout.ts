import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth';
import { useAnswersStore } from '../../stores/answers';

type Logout = () => void;

export function useLogout(): Logout {
  const queryClient = useQueryClient();

  return () => {
    useAuthStore.getState().clear();
    useAnswersStore.getState().reset();
    queryClient.clear();
  };
}
