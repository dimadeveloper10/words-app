import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { CardImage } from '../../../components/CardImage';
import { Carousel } from '../../../components/Carousel';
import type { Topic } from '../topics.types';

export function TopicsCarousel({ topics }: { topics: Topic[] }): JSX.Element {
  if (topics.length === 0) {
    return <p>No topics yet.</p>;
  }

  return (
    <Carousel
      items={topics}
      getKey={(topic) => topic.id}
      label="Topic cards"
      renderItem={(topic) => (
        <Link
          to={`/topics/${topic.id}`}
          className="carousel-card carousel-card-link"
        >
          <div>
            <CardImage imageId={topic.imageId} name={topic.name} />
            <div className="carousel-card-text">
              <h3>{topic.name}</h3>
              {topic.description && <p>{topic.description}</p>}
            </div>
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
        </Link>
      )}
    />
  );
}
