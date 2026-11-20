import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { BaseSyntheticEvent } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import type { AuthResult } from '../../types/auth';
import { register } from './auth.api';
import { registerSchema, type RegisterValues } from './auth.schemas';
import { useAuthSuccess } from './useAuthSuccess';

type RegisterForm = {
  form: UseFormReturn<RegisterValues>;
  mutation: UseMutationResult<AuthResult, Error, RegisterValues>;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
};

export function useRegisterForm(): RegisterForm {
  const onSuccess = useAuthSuccess();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', name: '' },
  });
  const mutation = useMutation({ mutationFn: register, onSuccess });

  return {
    form,
    mutation,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
  };
}
