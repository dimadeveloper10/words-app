import { Link } from 'react-router-dom';
import { CardImage } from '../../../components/CardImage';
import { useLessonPoints } from '../../word-answers/useWordAnswers';
import { formatLessonTitle } from '../formatLessonTitle';
import type { Lesson } from '../lessons.types';
import '../../../components/Carousel.css';

interface LessonCardProps {
  lesson: Lesson;
  headingLevel?: 'h2' | 'h3';
}

export function LessonCard({ lesson, headingLevel = 'h3' }: LessonCardProps) {
  const Heading = headingLevel;
  const points = useLessonPoints(lesson.id);

  return (
    <Link
      to={`/lessons/${lesson.id}`}
      className="carousel-card carousel-card-link"
    >
      <div>
        <CardImage imageId={lesson.imageId} name={lesson.name} />
        <div className="carousel-card-text">
          <Heading>{formatLessonTitle(lesson)}</Heading>
        </div>
      </div>
      <dl className="carousel-card-stats">
        <div>
          <dt>Points</dt>
          <dd>{points}</dd>
        </div>
        <div>
          <dt>Words</dt>
          <dd>{lesson.wordCount}</dd>
        </div>
      </dl>
    </Link>
  );
}
