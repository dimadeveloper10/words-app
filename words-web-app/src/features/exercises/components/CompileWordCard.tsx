import type { JSX } from 'react';
import { Card } from '../../../components/Card';
import { CardStats } from '../../../components/CardStats';

interface CompileWordCardProps {
  lessonId: string;
}

const notAvailable = (
  <>
    <span aria-hidden="true">—</span>
    <span className="visually-hidden">Not available</span>
  </>
);

export function CompileWordCard({
  lessonId,
}: CompileWordCardProps): JSX.Element {
  return (
    <Card to={`/lessons/${lessonId}/compile-word`}>
      <h2 className="card__title">Compile word</h2>
      <CardStats stats={[{ label: 'Points', value: notAvailable }]} />
    </Card>
  );
}
