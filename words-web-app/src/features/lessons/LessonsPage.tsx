import { PageHeader } from '../../components/PageHeader';
import { useTopics } from '../topics/useTopics';
import { LessonsTopicItem } from './LessonsTopicItem';
import './LessonsPage.css';

export function LessonsPage() {
  const topics = useTopics();

  return (
    <main className="session-page" aria-labelledby="lessons-page-title">
      <PageHeader id="lessons-page-title" title="Lessons" backTo="/" />
      {topics.length === 0 ? (
        <p>No topics yet.</p>
      ) : (
        <ul className="topic-lessons-list">
          {topics.map((topic) => (
            <LessonsTopicItem key={topic.id} topic={topic} />
          ))}
        </ul>
      )}
    </main>
  );
}
