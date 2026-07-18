import axios, { AxiosError } from 'axios';

import { useAuthStore } from '@/stores/auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach the Bearer token to every request.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 the token is invalid/expired — drop the session so protected
// routes redirect to /login on the next render.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clear();
    }
    return Promise.reject(error);
  },
);

/** Extracts a human-readable message from a NestJS error response. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      { message?: string | string[] } | undefined;
    const message = data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  return fallback;
}
