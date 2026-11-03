import { Carousel } from '../../components/Carousel';
import { LessonCard } from './LessonCard';
import type { Lesson } from './lessons.types';

interface LessonsCarouselProps {
  lessons: Lesson[];
  label?: string;
}

export function LessonsCarousel({
  lessons,
  label = 'Lesson cards',
}: LessonsCarouselProps) {
  if (lessons.length === 0) return <p>No lessons yet.</p>;

  return (
    <Carousel
      items={lessons}
      getKey={(lesson) => lesson.id}
      label={label}
      renderItem={(lesson) => <LessonCard lesson={lesson} />}
    />
  );
}
