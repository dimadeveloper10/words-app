import type { JSX } from 'react';
import { Card } from '../../../components/Card';
import { CardStats } from '../../../components/CardStats';

interface LessonWordsCardProps {
  lessonId: string;
  wordCount: number;
}

export function LessonWordsCard({
  lessonId,
  wordCount,
}: LessonWordsCardProps): JSX.Element {
  return (
    <Card to={`/lessons/${lessonId}/words`}>
      <h2 className="card__title">Words</h2>
      <CardStats stats={[{ label: 'Words', value: wordCount }]} />
    </Card>
  );
}
