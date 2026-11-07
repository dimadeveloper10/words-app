import { useCallback, useEffect } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { useLogout } from '../features/auth/useLogout';
import { useAnswersSync } from '../features/word-answers/useAnswersSync';
import { getApiErrorMessage } from '../lib/api';
import { useAnswersStore } from '../stores/answers';
import { useCatalogStore } from '../stores/catalog';
import type { User } from '../types/auth';
import { AppHeader } from './AppHeader';

export function CatalogLoader() {
  const user = useOutletContext<User>();
  const logout = useLogout();
  useAnswersSync();
  const catalogStatus = useCatalogStore((state) => state.status);
  const catalogError = useCatalogStore((state) => state.error);
  const loadCatalog = useCatalogStore((state) => state.load);
  const answersStatus = useAnswersStore((state) => state.status);
  const answersError = useAnswersStore((state) => state.error);
  const loadAnswers = useAnswersStore((state) => state.load);

  const load = useCallback(() => {
    void loadCatalog();
    void loadAnswers(user.id);
  }, [loadCatalog, loadAnswers, user.id]);

  useEffect(load, [load]);

  const status =
    catalogStatus === 'error' || answersStatus === 'error'
      ? 'error'
      : catalogStatus === 'ready' && answersStatus === 'ready'
        ? 'ready'
        : 'loading';
  const error = catalogError ?? answersError;

  if (status === 'ready') {
    return <Outlet context={user} />;
  }

  return (
    <>
      <AppHeader email={user.email} onLogout={logout} />
      {status === 'error' ? (
        <main className="session-page">
          <p role="alert">
            {getApiErrorMessage(error, 'Unable to load data.')}
          </p>
          <button className="auth-submit" onClick={load}>
            Try again
          </button>
        </main>
      ) : (
        <main className="session-page" role="status">
          Loading…
        </main>
      )}
    </>
  );
}
