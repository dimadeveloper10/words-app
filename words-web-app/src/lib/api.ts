import axios from 'axios';
import { useAuthStore } from '../stores/auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      error.config?.headers.Authorization ===
        `Bearer ${useAuthStore.getState().token}`
    ) {
      useAuthStore.getState().clear();
    }
    return Promise.reject(
      error instanceof Error ? error : new Error(String(error)),
    );
  },
);

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
    if (!error.response) return 'Unable to reach the server. Please try again.';
  }
  return fallback;
}
