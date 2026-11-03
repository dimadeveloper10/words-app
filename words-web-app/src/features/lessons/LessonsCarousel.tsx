import { Carousel } from '../../components/Carousel';
import { LessonCard } from './LessonCard';
import type { Lesson } from './lessons.types';

export function LessonsCarousel({ lessons }: { lessons: Lesson[] }) {
  if (lessons.length === 0) return <p>No lessons yet.</p>;

  return (
    <Carousel
      items={lessons}
      getKey={(lesson) => lesson.id}
      label="Lesson cards"
      renderItem={(lesson) => <LessonCard lesson={lesson} />}
    />
  );
}
