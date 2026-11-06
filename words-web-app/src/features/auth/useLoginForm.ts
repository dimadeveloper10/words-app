import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { login } from './auth.api';
import { loginSchema, type LoginValues } from './auth.schemas';
import { useAuthSuccess } from './useAuthSuccess';

export function useLoginForm() {
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
