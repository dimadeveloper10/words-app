import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, Outlet } from 'react-router-dom';
import { getApiErrorMessage } from '../../lib/api';
import { useAuthStore } from '../../stores/auth';
import { getMe } from './auth.api';

export function RequireAuth() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const session = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    enabled: Boolean(token),
    retry: false,
    staleTime: 60_000,
  });

  if (!token) return <Navigate to="/login" replace />;
  if (session.isPending) {
    return (
      <main className="session-page" role="status">
        Checking your session…
      </main>
    );
  }
  if (session.isError) {
    return (
      <main className="session-page">
        <p role="alert">
          {getApiErrorMessage(session.error, 'Unable to load your account.')}
        </p>
        <button className="auth-submit" onClick={() => void session.refetch()}>
          Try again
        </button>
        <button
          onClick={() => {
            useAuthStore.getState().clear();
            queryClient.clear();
          }}
        >
          Sign out
        </button>
      </main>
    );
  }
  return <Outlet context={session.data} />;
}
