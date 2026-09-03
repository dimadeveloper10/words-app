import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { WordTopic } from './words.types';

interface WordTopicsProps {
  topics: WordTopic[];
  empty?: ReactNode;
  className?: string;
}

export function WordTopics({
  topics,
  empty = null,
  className,
}: WordTopicsProps) {
  if (topics.length === 0) {
    return empty;
  }

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {topics.map((topic) => (
        <Badge key={topic.id} variant="secondary">
          {topic.name}
        </Badge>
      ))}
    </div>
  );
}
