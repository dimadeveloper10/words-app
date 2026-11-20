import type { JSX } from 'react';
import { FALLBACK_FORMAT, IMAGE_FORMATS, getImageUrl } from '../lib/images';
import './Picture.css';

interface PictureProps {
  imageId: string;
  alt: string;
}

export function Picture({ imageId, alt }: PictureProps): JSX.Element {
  return (
    <picture className="picture">
      {IMAGE_FORMATS.map((format) => (
        <source
          key={format.ext}
          srcSet={getImageUrl(imageId, format.ext)}
          type={format.type}
        />
      ))}
      <img
        className="picture__img"
        src={getImageUrl(imageId, FALLBACK_FORMAT)}
        alt={alt}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}
