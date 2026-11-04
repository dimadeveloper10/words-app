import { Link } from 'react-router-dom';
import '../../components/Carousel.css';

export function CompileWordCard({ lessonId }: { lessonId: string }) {
  return (
    <Link
      to={`/lessons/${lessonId}/compile-word`}
      className="carousel-card carousel-card-link"
    >
      <h2>Compile word</h2>
      <dl className="carousel-card-stats">
        <div>
          <dt>Points</dt>
          <dd>
            <span aria-label="Not available">—</span>
          </dd>
        </div>
      </dl>
    </Link>
  );
}
