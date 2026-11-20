import type { JSX } from 'react';
import { Card } from '../../../components/Card';
import { CardImage } from '../../../components/CardImage';
import { CardStats } from '../../../components/CardStats';
import type { Topic } from '../topics.types';

interface TopicCardProps {
  topic: Topic;
  compact?: boolean;
}

export function TopicCard({
  topic,
  compact = false,
}: TopicCardProps): JSX.Element {
  return (
    <Card to={`/topics/${topic.id}`} compact={compact}>
      <div>
        <CardImage imageId={topic.imageId} name={topic.name} />
        <div className="card__text">
          <h3 className="card__title">{topic.name}</h3>
          {topic.description && (
            <p className="card__description">{topic.description}</p>
          )}
        </div>
      </div>
      <CardStats
        stats={[
          { label: 'Lessons', value: topic.lessonCount },
          { label: 'Words', value: topic.wordCount },
        ]}
      />
    </Card>
  );
}
