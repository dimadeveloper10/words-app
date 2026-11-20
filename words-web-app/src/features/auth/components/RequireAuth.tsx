import type { JSX } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate, Outlet } from 'react-router-dom';
import { getApiErrorMessage } from '../../../lib/api';
import { useAuthStore } from '../../../stores/auth';
import { useSession } from '../useSession';

export function RequireAuth(): JSX.Element {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const session = useSession();

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (session.isPending) {
    return (
      <main className="page" role="status">
        Checking your session…
      </main>
    );
  }
  if (session.isError) {
    return (
      <main className="page">
        <p role="alert">
          {getApiErrorMessage(session.error, 'Unable to load your account.')}
        </p>
        <div className="page__actions">
          <button
            type="button"
            className="button button--primary"
            onClick={() => void session.refetch()}
          >
            Try again
          </button>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => {
              useAuthStore.getState().clear();
              queryClient.clear();
            }}
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }
  return <Outlet context={session.data} />;
}
