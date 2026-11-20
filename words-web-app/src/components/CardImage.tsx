import type { JSX } from 'react';
import { Picture } from './Picture';

interface CardImageProps {
  imageId: string | null;
  name: string;
}

export function CardImage({ imageId, name }: CardImageProps): JSX.Element {
  return (
    <div className="carousel-card-image">
      {imageId ? (
        <Picture imageId={imageId} alt="" />
      ) : (
        <span aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}
