import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import { login, register } from './auth.api';
import { registerSchema, type RegisterValues } from './auth.schemas';

export function useAuthForm(mode: 'login' | 'register') {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', name: '' },
  });
  const mutation = useMutation({
    mutationFn: mode === 'login' ? login : register,
    onSuccess: ({ accessToken, user }) => {
      queryClient.clear();
      queryClient.setQueryData(['auth', 'me'], user);
      useAuthStore.getState().setAuth(accessToken, user);
      void navigate('/', { replace: true });
    },
  });

  return {
    form,
    mutation,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
  };
}
