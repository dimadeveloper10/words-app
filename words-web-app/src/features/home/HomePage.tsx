import { useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import type { User } from '../../types/auth';

export function HomePage() {
  const user = useOutletContext<User>();
  const queryClient = useQueryClient();

  function logout() {
    useAuthStore.getState().clear();
    queryClient.clear();
  }

  return (
    <main className="session-page">
      <span className="brand">Words</span>
      <h1>Welcome, {user.name || user.email}</h1>
      <p>You’re signed in and ready to learn.</p>
      <button className="auth-submit" onClick={logout}>
        Sign out
      </button>
    </main>
  );
}
