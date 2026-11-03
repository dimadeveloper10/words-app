import { useOutletContext } from 'react-router-dom';
import { AppHeader } from '../../components/AppHeader';
import { PageHeader } from '../../components/PageHeader';
import { getApiErrorMessage } from '../../lib/api';
import type { User } from '../../types/auth';
import { useLogout } from '../auth/useLogout';
import { TopicListItem } from './TopicListItem';
import { useTopics } from './useTopics';
import './TopicsPage.css';

export function TopicsPage() {
  const user = useOutletContext<User>();
  const logout = useLogout();
  const topics = useTopics();

  return (
    <>
      <AppHeader email={user.email} onLogout={logout} />
      <main
        className="session-page"
        aria-labelledby="topics-page-title"
        aria-busy={topics.isPending}
      >
        <PageHeader id="topics-page-title" title="Topics" backTo="/" />
        {topics.isPending && <p role="status">Loading topics…</p>}
        {topics.isSuccess && topics.data.length === 0 && <p>No topics yet.</p>}
        {topics.isSuccess && topics.data.length > 0 && (
          <ul className="topic-list">
            {topics.data.map((topic) => (
              <TopicListItem key={topic.id} topic={topic} />
            ))}
          </ul>
        )}
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
      </main>
    </>
  );
}
