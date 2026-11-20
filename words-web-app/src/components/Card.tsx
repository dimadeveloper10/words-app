import type { JSX, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './Card.css';

interface CardProps {
  to: string;
  compact?: boolean;
  children: ReactNode;
}

export function Card({
  to,
  compact = false,
  children,
}: CardProps): JSX.Element {
  return (
    <Link to={to} className={compact ? 'card card--compact' : 'card'}>
      {children}
    </Link>
  );
}
