import type { JSX, ReactNode } from 'react';
import './Card.css';

interface CardStat {
  label: string;
  value: ReactNode;
}

interface CardStatsProps {
  stats: CardStat[];
}

export function CardStats({ stats }: CardStatsProps): JSX.Element {
  return (
    <dl className="card__stats">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dt className="card__stat-label">{stat.label}</dt>
          <dd className="card__stat-value">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
