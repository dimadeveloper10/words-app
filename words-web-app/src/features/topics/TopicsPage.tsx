import { PageHeader } from '../../components/PageHeader';
import { TopicListItem } from './TopicListItem';
import { useTopics } from './useTopics';
import './TopicsPage.css';

export function TopicsPage() {
  const topics = useTopics();

  return (
    <main className="session-page" aria-labelledby="topics-page-title">
      <PageHeader id="topics-page-title" title="Topics" backTo="/" />
      {topics.length === 0 ? (
        <p>No topics yet.</p>
      ) : (
        <ul className="topic-list">
          {topics.map((topic) => (
            <TopicListItem key={topic.id} topic={topic} />
          ))}
        </ul>
      )}
    </main>
  );
}
