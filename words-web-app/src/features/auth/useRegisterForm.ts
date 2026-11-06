import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { register } from './auth.api';
import { registerSchema, type RegisterValues } from './auth.schemas';
import { useAuthSuccess } from './useAuthSuccess';

export function useRegisterForm() {
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
