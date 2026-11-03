import { Carousel } from '../../components/Carousel';
import type { Topic } from './topics.types';

export function TopicsCarousel({ topics }: { topics: Topic[] }) {
  if (topics.length === 0) return <p>No topics yet.</p>;

  return (
    <Carousel
      items={topics}
      getKey={(topic) => topic.id}
      label="Topic cards"
      renderItem={(topic) => (
        <article className="carousel-card">
          <div>
            <h3>{topic.name}</h3>
            {topic.description && <p>{topic.description}</p>}
          </div>
          <dl className="carousel-card-stats">
            <div>
              <dt>Lessons</dt>
              <dd>{topic.lessonCount}</dd>
            </div>
            <div>
              <dt>Words</dt>
              <dd>{topic.wordCount}</dd>
            </div>
          </dl>
        </article>
      )}
    />
  );
}
