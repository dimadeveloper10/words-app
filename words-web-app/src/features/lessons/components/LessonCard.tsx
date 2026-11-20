import type { JSX } from 'react';
import { Card } from '../../../components/Card';
import { CardImage } from '../../../components/CardImage';
import { CardStats } from '../../../components/CardStats';
import { useLessonPoints } from '../../word-answers/useWordAnswers';
import { formatLessonTitle } from '../formatLessonTitle';
import type { Lesson } from '../lessons.types';

interface LessonCardProps {
  lesson: Lesson;
  headingLevel?: 'h2' | 'h3';
  compact?: boolean;
}

export function LessonCard({
  lesson,
  headingLevel = 'h3',
  compact = false,
}: LessonCardProps): JSX.Element {
  const Heading = headingLevel;
  const points = useLessonPoints(lesson.id);

  return (
    <Card to={`/lessons/${lesson.id}`} compact={compact}>
      <div>
        <CardImage imageId={lesson.imageId} name={lesson.name} />
        <div className="card__text">
          <Heading className="card__title">{formatLessonTitle(lesson)}</Heading>
        </div>
      </div>
      <CardStats
        stats={[
          { label: 'Points', value: points },
          { label: 'Words', value: lesson.wordCount },
        ]}
      />
    </Card>
  );
}
