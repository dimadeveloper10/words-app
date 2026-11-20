import type { JSX } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useTopics } from '../topics/useTopics';
import { LessonsTopicItem } from './components/LessonsTopicItem';
import './LessonsPage.css';

export function LessonsPage(): JSX.Element {
  const topics = useTopics();

  return (
    <main className="page" aria-labelledby="lessons-page-title">
      <PageHeader id="lessons-page-title" title="Lessons" backTo="/" />
      {topics.length === 0 ? (
        <p>No topics yet.</p>
      ) : (
        <ul className="lessons-page__list">
          {topics.map((topic) => (
            <LessonsTopicItem key={topic.id} topic={topic} />
          ))}
        </ul>
      )}
    </main>
  );
}
