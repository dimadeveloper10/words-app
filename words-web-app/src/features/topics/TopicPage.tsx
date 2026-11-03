import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { LessonCard } from '../lessons/LessonCard';
import { useTopicLessons } from '../lessons/useLessons';
import { useTopic } from './useTopics';
import './TopicPage.css';

export function TopicPage() {
  const { topicId = '' } = useParams();
  const topic = useTopic(topicId);
  const lessons = useTopicLessons(topicId);

  if (!topic) {
    return (
      <main className="session-page" aria-labelledby="topic-page-title">
        <PageHeader id="topic-page-title" title="Topic" backTo="/topics" />
        <p role="alert">Topic not found.</p>
      </main>
    );
  }

  return (
    <main className="session-page" aria-labelledby="topic-page-title">
      <PageHeader id="topic-page-title" title={topic.name} backTo="/topics" />
      {lessons.length === 0 ? (
        <p>No lessons in this topic yet.</p>
      ) : (
        <ul className="lesson-grid" aria-label="Lessons">
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <LessonCard lesson={lesson} headingLevel="h2" />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
