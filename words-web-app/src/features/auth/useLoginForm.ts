import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { BaseSyntheticEvent } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import type { AuthResult } from '../../types/auth';
import { login } from './auth.api';
import { loginSchema, type LoginValues } from './auth.schemas';
import { useAuthSuccess } from './useAuthSuccess';

type LoginForm = {
  form: UseFormReturn<LoginValues>;
  mutation: UseMutationResult<AuthResult, Error, LoginValues>;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
};

export function useLoginForm(): LoginForm {
  const onSuccess = useAuthSuccess();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const mutation = useMutation({ mutationFn: login, onSuccess });

  return {
    form,
    mutation,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
  };
}
