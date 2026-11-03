import { Link } from 'react-router-dom';
import type { Topic } from './topics.types';

function formatLessonCount(count: number) {
  return `${count} ${count === 1 ? 'lesson' : 'lessons'}`;
}

export function TopicListItem({ topic }: { topic: Topic }) {
  return (
    <li>
      <Link to={`/topics/${topic.id}`} className="topic-list-item">
        <span className="topic-thumb" aria-hidden="true">
          {topic.name.charAt(0).toUpperCase()}
        </span>
        <div className="topic-list-text">
          <h2 className="topic-list-name">{topic.name}</h2>
          <p className="topic-list-meta">
            {formatLessonCount(topic.lessonCount)}
          </p>
        </div>
        <svg
          className="topic-list-arrow"
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      </Link>
    </li>
  );
}
