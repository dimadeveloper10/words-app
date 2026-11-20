import type { Lesson } from './lessons.types';

export function formatLessonTitle(
  lesson: Pick<Lesson, 'lessonNumber' | 'name'>,
): string {
  return lesson.lessonNumber === null
    ? lesson.name
    : `${lesson.lessonNumber}. ${lesson.name}`;
}
