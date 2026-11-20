import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { formatLessonCount } from '../formatLessonCount';
import type { Topic } from '../topics.types';
import './TopicListItem.css';

interface TopicListItemProps {
  topic: Topic;
}

export function TopicListItem({ topic }: TopicListItemProps): JSX.Element {
  return (
    <li>
      <Link to={`/topics/${topic.id}`} className="topic-list-item">
        <span className="topic-list-item__thumb" aria-hidden="true">
          {topic.name.charAt(0).toUpperCase()}
        </span>
        <div className="topic-list-item__text">
          <h2 className="topic-list-item__name">{topic.name}</h2>
          <p className="topic-list-item__meta">
            {formatLessonCount(topic.lessonCount)}
          </p>
        </div>
        <svg
          className="topic-list-item__arrow"
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
