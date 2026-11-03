import { Link } from 'react-router-dom';
import type { Topic } from '../topics/topics.types';
import { LessonsCarousel } from './LessonsCarousel';
import { useTopicLessons } from './useLessons';

function formatLessonCount(count: number) {
  return `${count} ${count === 1 ? 'lesson' : 'lessons'}`;
}

export function LessonsTopicItem({ topic }: { topic: Topic }) {
  const lessons = useTopicLessons(topic.id);

  return (
    <li>
      <Link to={`/topics/${topic.id}`} className="lessons-topic-row">
        <span className="lessons-topic-thumb" aria-hidden="true">
          {topic.name.charAt(0).toUpperCase()}
        </span>
        <div className="lessons-topic-text">
          <h2 className="lessons-topic-name">{topic.name}</h2>
          <p className="lessons-topic-meta">
            {formatLessonCount(lessons.length)}
          </p>
        </div>
        <svg
          className="lessons-topic-arrow"
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
