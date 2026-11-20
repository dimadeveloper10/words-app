import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { useGoBack } from './useGoBack';
import './PageHeader.css';

interface PageHeaderProps {
  id: string;
  title: string;
  backTo: string;
}

export function PageHeader({
  id,
  title,
  backTo,
}: PageHeaderProps): JSX.Element {
  const goBack = useGoBack();

  return (
    <div className="page-header">
      <Link
        to={backTo}
        className="page-header__back"
        aria-label="Go back"
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
          <path d="m15 6-6 6 6 6" />
        </svg>
      </Link>
      <h1 id={id} className="page-header__title">
        {title}
      </h1>
    </div>
  );
}
