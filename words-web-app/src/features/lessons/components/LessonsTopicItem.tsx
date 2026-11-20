import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { formatLessonCount } from '../../topics/formatLessonCount';
import type { Topic } from '../../topics/topics.types';
import { useTopicLessons } from '../useLessons';
import { LessonsCarousel } from './LessonsCarousel';
import './LessonsTopicItem.css';

interface LessonsTopicItemProps {
  topic: Topic;
}

export function LessonsTopicItem({
  topic,
}: LessonsTopicItemProps): JSX.Element {
  const lessons = useTopicLessons(topic.id);

  return (
    <li className="lessons-topic-item">
      <Link to={`/topics/${topic.id}`} className="lessons-topic-item__row">
        <span className="lessons-topic-item__thumb" aria-hidden="true">
          {topic.name.charAt(0).toUpperCase()}
        </span>
        <div className="lessons-topic-item__text">
          <h2 className="lessons-topic-item__name">{topic.name}</h2>
          <p className="lessons-topic-item__meta">
            {formatLessonCount(lessons.length)}
          </p>
        </div>
        <svg
          className="lessons-topic-item__arrow"
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
      <LessonsCarousel lessons={lessons} label={`${topic.name} lessons`} />
    </li>
  );
}
