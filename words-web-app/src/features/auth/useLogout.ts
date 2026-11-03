import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth';
import { useCatalogStore } from '../../stores/catalog';

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    useAuthStore.getState().clear();
    useCatalogStore.getState().reset();
    queryClient.clear();
  };
}
