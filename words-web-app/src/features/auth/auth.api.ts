import { api } from '../../lib/api';
import type { AuthResult, User } from '../../types/auth';
import type { LoginValues, RegisterValues } from './auth.schemas';

export async function login({ email, password }: LoginValues) {
  const { data } = await api.post<AuthResult>('/auth/login', {
    email,
    password,
  });
  return data;
}

export async function register({ email, password, name }: RegisterValues) {
  const { data } = await api.post<AuthResult>('/auth/register', {
    email,
    password,
    ...(name ? { name } : {}),
  });
  return data;
}

export async function getMe() {
  const { data } = await api.get<User>('/auth/me');
  return data;
}
