import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import type { WordLesson } from './words.types';

interface WordLessonsProps {
  lessons?: WordLesson[];
  empty?: ReactNode;
  className?: string;
}

export function WordLessons({
  lessons = [],
  empty = null,
  className,
}: WordLessonsProps) {
  if (lessons.length === 0) {
    return empty;
  }

  return (
    <span className={cn('whitespace-nowrap text-sm', className)}>
      {lessons
        .map((lesson) =>
          lesson.lessonNumber === null
            ? lesson.name
            : `#${lesson.lessonNumber} ${lesson.name}`,
        )
        .join(', ')}
    </span>
  );
}
