import { Link } from 'react-router-dom';
import { useTopics } from '../topics/useTopics';
import { useLessons } from '../lessons/useLessons';
import { LessonsCarousel } from '../lessons/LessonsCarousel';
import { TopicsCarousel } from '../topics/TopicsCarousel';
import './HomePage.css';

export function HomePage() {
  const topics = useTopics();
  const lessons = useLessons();

  return (
    <main className="session-page" aria-label="Learning overview">
      <section aria-labelledby="topics-heading">
        <h2 id="topics-heading" className="section-heading">
          <Link to="/topics" className="section-heading-link">
            Topics
          </Link>
          <span className="section-count">{topics.length}</span>
        </h2>
        <TopicsCarousel topics={topics} />
      </section>
      <section aria-labelledby="lessons-heading">
        <h2 id="lessons-heading" className="section-heading">
          <Link to="/lessons" className="section-heading-link">
            Lessons
          </Link>
          <span className="section-count">{lessons.length}</span>
        </h2>
        <LessonsCarousel lessons={lessons} />
      </section>
    </main>
  );
}
