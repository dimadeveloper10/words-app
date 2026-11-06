import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import type { AuthResult } from '../../types/auth';

export function useAuthSuccess() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return ({ accessToken, user }: AuthResult) => {
    queryClient.clear();
    queryClient.setQueryData(['auth', 'me'], user);
    useAuthStore.getState().setAuth(accessToken, user);
    void navigate('/', { replace: true });
  };
}
