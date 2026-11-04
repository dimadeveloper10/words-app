import { Link } from 'react-router-dom';
import { useGoBack } from '../../components/useGoBack';
import './ExerciseHeader.css';

interface ExerciseHeaderProps {
  id: string;
  title: string;
  closeTo: string;
}

export function ExerciseHeader({ id, title, closeTo }: ExerciseHeaderProps) {
  const goBack = useGoBack();

  return (
    <header className="exercise-header">
      <Link
        to={closeTo}
        className="exercise-close"
        aria-label="Close exercise"
        onClick={goBack}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </Link>
      <h1 id={id} className="exercise-title">
        {title}
      </h1>
    </header>
  );
}
