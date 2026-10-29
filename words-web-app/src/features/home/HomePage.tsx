import { useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import type { User } from '../../types/auth';
import { getApiErrorMessage } from '../../lib/api';
import { useTopics } from '../topics/useTopics';
import { useLessons } from '../lessons/useLessons';

export function HomePage() {
  const user = useOutletContext<User>();
  const queryClient = useQueryClient();
  const topics = useTopics();
  const lessons = useLessons();

  function logout() {
    useAuthStore.getState().clear();
    queryClient.clear();
  }

  return (
    <main className="session-page">
      <span className="brand">Words</span>
      <h1>Welcome, {user.name || user.email}</h1>
      <p>You’re signed in and ready to learn.</p>
      <section aria-labelledby="topics-heading" aria-busy={topics.isPending}>
        <h2 id="topics-heading" className="section-heading">
          Topics
          {topics.isSuccess && (
            <span className="section-count">{topics.data.length}</span>
          )}
        </h2>
        {topics.isPending && <p role="status">Loading topics…</p>}
        {topics.isError && (
          <>
            <p role="alert">
              {getApiErrorMessage(topics.error, 'Unable to load topics.')}
            </p>
            <button
              className="auth-submit"
              onClick={() => void topics.refetch()}
              disabled={topics.isFetching}
            >
              {topics.isFetching ? 'Retrying…' : 'Try again'}
            </button>
          </>
        )}
      </section>
      <section aria-labelledby="lessons-heading" aria-busy={lessons.isPending}>
        <h2 id="lessons-heading" className="section-heading">
          Lessons
          {lessons.isSuccess && (
            <span className="section-count">{lessons.data.length}</span>
          )}
        </h2>
        {lessons.isPending && <p role="status">Loading lessons…</p>}
        {lessons.isError && (
          <>
            <p role="alert">
              {getApiErrorMessage(lessons.error, 'Unable to load lessons.')}
            </p>
            <button
              className="auth-submit"
              onClick={() => void lessons.refetch()}
              disabled={lessons.isFetching}
            >
              {lessons.isFetching ? 'Retrying…' : 'Try again'}
            </button>
          </>
        )}
      </section>
      <button className="auth-submit" onClick={logout}>
        Sign out
      </button>
    </main>
  );
}
