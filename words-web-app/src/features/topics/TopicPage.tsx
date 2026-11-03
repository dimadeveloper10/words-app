import { useOutletContext, useParams } from 'react-router-dom';
import { AppHeader } from '../../components/AppHeader';
import { PageHeader } from '../../components/PageHeader';
import { getApiErrorMessage } from '../../lib/api';
import type { User } from '../../types/auth';
import { useLogout } from '../auth/useLogout';
import { LessonCard } from '../lessons/LessonCard';
import { useLessons } from '../lessons/useLessons';
import { useTopic } from './useTopics';
import './TopicPage.css';

export function TopicPage() {
  const { topicId = '' } = useParams();
  const user = useOutletContext<User>();
  const logout = useLogout();
  const topic = useTopic(topicId);
  const lessons = useLessons(topicId);

  if (topic.isError) {
    return (
      <>
        <AppHeader email={user.email} onLogout={logout} />
        <main className="session-page" aria-labelledby="topic-page-title">
          <PageHeader id="topic-page-title" title="Topic" backTo="/topics" />
          <p role="alert">
            {getApiErrorMessage(topic.error, 'Unable to load this topic.')}
          </p>
          <button
            className="auth-submit"
            onClick={() => void topic.refetch()}
            disabled={topic.isFetching}
          >
            {topic.isFetching ? 'Retrying…' : 'Try again'}
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader email={user.email} onLogout={logout} />
      <main
        className="session-page"
        aria-labelledby="topic-page-title"
        aria-busy={topic.isPending || lessons.isPending}
      >
        <PageHeader
          id="topic-page-title"
          title={topic.data?.name ?? 'Loading topic…'}
          backTo="/topics"
        />
        {lessons.isPending && <p role="status">Loading lessons…</p>}
        {lessons.isSuccess && lessons.data.length === 0 && (
          <p>No lessons in this topic yet.</p>
        )}
        {lessons.isSuccess && lessons.data.length > 0 && (
          <ul className="lesson-grid" aria-label="Lessons">
            {lessons.data.map((lesson) => (
              <li key={lesson.id}>
                <LessonCard lesson={lesson} headingLevel="h2" />
              </li>
            ))}
          </ul>
        )}
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
      </main>
    </>
  );
}
