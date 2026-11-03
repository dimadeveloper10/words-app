import { Carousel } from '../../components/Carousel';
import type { Lesson } from './lessons.types';

export function LessonsCarousel({ lessons }: { lessons: Lesson[] }) {
  if (lessons.length === 0) return <p>No lessons yet.</p>;

  return (
    <Carousel
      items={lessons}
      getKey={(lesson) => lesson.id}
      label="Lesson cards"
      renderItem={(lesson) => (
        <article className="carousel-card">
          <h3>
            {lesson.lessonNumber}. {lesson.name}
          </h3>
          <dl className="carousel-card-stats">
            <div>
              <dt>Points</dt>
              <dd>
                <span aria-label="Not available">—</span>
              </dd>
            </div>
            <div>
              <dt>Words</dt>
              <dd>{lesson.wordCount}</dd>
            </div>
          </dl>
        </article>
      )}
    />
  );
}
