import type { JSX } from 'react';
import { Carousel } from '../../../components/Carousel';
import type { Topic } from '../topics.types';
import { TopicCard } from './TopicCard';

interface TopicsCarouselProps {
  topics: Topic[];
}

export function TopicsCarousel({ topics }: TopicsCarouselProps): JSX.Element {
  if (topics.length === 0) {
    return <p>No topics yet.</p>;
  }

  return (
    <Carousel
      items={topics}
      getKey={(topic) => topic.id}
      label="Topic cards"
      renderItem={(topic) => <TopicCard topic={topic} compact />}
    />
  );
}
