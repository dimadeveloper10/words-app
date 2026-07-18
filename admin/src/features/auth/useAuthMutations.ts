import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { login, register } from './auth.api';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: login,
    onSuccess: ({ accessToken, user }) => {
      setAuth(accessToken, user);
      toast.success(`Welcome back, ${user.name ?? user.email}`);
      void navigate('/', { replace: true });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Login failed'));
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: register,
    onSuccess: ({ accessToken, user }) => {
      setAuth(accessToken, user);
      toast.success('Account created');
      void navigate('/', { replace: true });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Registration failed'));
    },
  });
}
