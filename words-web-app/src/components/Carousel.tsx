import type { JSX, ReactNode } from 'react';
import './Carousel.css';

interface CarouselProps<T> {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  label: string;
}

export function Carousel<T>({
  items,
  getKey,
  renderItem,
  label,
}: CarouselProps<T>): JSX.Element {
  return (
    <section className="carousel" aria-label={label} tabIndex={0}>
      <ul className="carousel__track">
        {items.map((item) => (
          <li className="carousel__slide" key={getKey(item)}>
            {renderItem(item)}
          </li>
        ))}
      </ul>
    </section>
  );
}
