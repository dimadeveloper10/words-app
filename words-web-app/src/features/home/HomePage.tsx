import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { useTopics } from '../topics/useTopics';
import { useLessons } from '../lessons/useLessons';
import { LessonsCarousel } from '../lessons/components/LessonsCarousel';
import { TopicsCarousel } from '../topics/components/TopicsCarousel';
import './HomePage.css';

export function HomePage(): JSX.Element {
  const topics = useTopics();
  const lessons = useLessons();

  return (
    <main className="page" aria-labelledby="home-title">
      <h1 id="home-title" className="visually-hidden">
        Learning overview
      </h1>
      <section aria-labelledby="topics-heading">
        <h2 id="topics-heading" className="home-page__heading">
          <Link to="/topics" className="home-page__heading-link">
            Topics
          </Link>
          <span className="home-page__count">{topics.length}</span>
        </h2>
        <TopicsCarousel topics={topics} />
      </section>
      <section aria-labelledby="lessons-heading">
        <h2 id="lessons-heading" className="home-page__heading">
          <Link to="/lessons" className="home-page__heading-link">
            Lessons
          </Link>
          <span className="home-page__count">{lessons.length}</span>
        </h2>
        <LessonsCarousel lessons={lessons} />
      </section>
    </main>
  );
}
