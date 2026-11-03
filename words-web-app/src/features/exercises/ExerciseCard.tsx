import { type ExerciseType, exerciseTypeNames } from './exerciseType';
import '../../components/Carousel.css';

export function ExerciseCard({ type }: { type: ExerciseType }) {
  return (
    <article className="carousel-card">
      <h2>{exerciseTypeNames[type]}</h2>
      <dl className="carousel-card-stats">
        <div>
          <dt>Points</dt>
          <dd>
            <span aria-label="Not available">—</span>
          </dd>
        </div>
      </dl>
    </article>
  );
}
