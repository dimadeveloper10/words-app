import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth';

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    useAuthStore.getState().clear();
    queryClient.clear();
  };
}
