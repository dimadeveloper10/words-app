import { useEffect } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { useLogout } from '../features/auth/useLogout';
import { getApiErrorMessage } from '../lib/api';
import { useCatalogStore } from '../stores/catalog';
import type { User } from '../types/auth';
import { AppHeader } from './AppHeader';

export function AppLayout() {
  const user = useOutletContext<User>();
  const logout = useLogout();
  const status = useCatalogStore((state) => state.status);
  const error = useCatalogStore((state) => state.error);
  const load = useCatalogStore((state) => state.load);

  useEffect(() => {
    void load();
  }, [load]);

  let content;
  if (status === 'ready') {
    content = <Outlet context={user} />;
  } else if (status === 'error') {
    content = (
      <main className="session-page">
        <p role="alert">
          {getApiErrorMessage(error, 'Unable to load lessons.')}
        </p>
        <button className="auth-submit" onClick={() => void load()}>
          Try again
        </button>
      </main>
    );
  } else {
    content = (
      <main className="session-page" role="status">
        Loading…
      </main>
    );
  }

  return (
    <>
      <AppHeader email={user.email} onLogout={logout} />
      {content}
    </>
  );
}
