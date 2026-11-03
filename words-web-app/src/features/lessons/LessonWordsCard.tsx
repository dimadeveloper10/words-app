import { Link } from 'react-router-dom';
import '../../components/Carousel.css';

interface LessonWordsCardProps {
  lessonId: string;
  wordCount: number;
}

export function LessonWordsCard({ lessonId, wordCount }: LessonWordsCardProps) {
  return (
    <Link
      to={`/lessons/${lessonId}/words`}
      className="carousel-card carousel-card-link"
    >
      <h2>Words</h2>
      <dl className="carousel-card-stats">
        <div>
          <dt>Words</dt>
          <dd>{wordCount}</dd>
        </div>
      </dl>
    </Link>
  );
}
