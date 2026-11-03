import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../../lib/api';
import { useTopics } from '../topics/useTopics';
import { useLessons } from '../lessons/useLessons';
import { LessonsCarousel } from '../lessons/LessonsCarousel';
import { TopicsCarousel } from '../topics/TopicsCarousel';
import './HomePage.css';

export function HomePage() {
  const topics = useTopics();
  const lessons = useLessons();

  return (
    <main className="session-page" aria-label="Learning overview">
      <section aria-labelledby="topics-heading" aria-busy={topics.isPending}>
        <h2 id="topics-heading" className="section-heading">
          <Link to="/topics" className="section-heading-link">
            Topics
          </Link>
          {topics.isSuccess && (
            <span className="section-count">{topics.data.length}</span>
          )}
        </h2>
        {topics.isPending && <p role="status">Loading topics…</p>}
        {topics.isSuccess && <TopicsCarousel topics={topics.data} />}
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
          <Link to="/lessons" className="section-heading-link">
            Lessons
          </Link>
          {lessons.isSuccess && (
            <span className="section-count">{lessons.data.length}</span>
          )}
        </h2>
        {lessons.isPending && <p role="status">Loading lessons…</p>}
        {lessons.isSuccess && <LessonsCarousel lessons={lessons.data} />}
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
    </main>
  );
}
