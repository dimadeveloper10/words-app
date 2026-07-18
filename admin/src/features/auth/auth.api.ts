import { api } from '@/lib/api';
import type { AuthResult, User } from '@/types/auth';
import type { LoginValues, RegisterValues } from './auth.schemas';

export async function login(values: LoginValues): Promise<AuthResult> {
  const { data } = await api.post<AuthResult>('/auth/login', values);
  return data;
}

export async function register(values: RegisterValues): Promise<AuthResult> {
  // Drop empty optional name so the API doesn't receive an empty string.
  const payload = {
    email: values.email,
    password: values.password,
    ...(values.name ? { name: values.name } : {}),
  };
  const { data } = await api.post<AuthResult>('/auth/register', payload);
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}
