import { Link } from 'react-router-dom';
import { formatLessonTitle } from './formatLessonTitle';
import type { Lesson } from './lessons.types';
import '../../components/Carousel.css';

interface LessonCardProps {
  lesson: Lesson;
  headingLevel?: 'h2' | 'h3';
}

export function LessonCard({ lesson, headingLevel = 'h3' }: LessonCardProps) {
  const Heading = headingLevel;

  return (
    <Link
      to={`/lessons/${lesson.id}`}
      className="carousel-card carousel-card-link"
    >
      <Heading>{formatLessonTitle(lesson)}</Heading>
      <dl className="carousel-card-stats">
        <div>
          <dt>Points</dt>
          <dd>
            <span aria-label="Not available">—</span>
          </dd>
        </div>
        <div>
          <dt>Words</dt>
          <dd>{lesson.wordCount}</dd>
        </div>
      </dl>
    </Link>
  );
}
