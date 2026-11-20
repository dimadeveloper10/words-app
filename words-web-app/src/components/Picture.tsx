import type { JSX } from 'react';
import { FALLBACK_FORMAT, IMAGE_FORMATS, getImageUrl } from '../lib/images';

interface PictureProps {
  imageId: string;
  alt: string;
  className?: string;
}

export function Picture({
  imageId,
  alt,
  className,
}: PictureProps): JSX.Element {
  return (
    <picture className={className}>
      {IMAGE_FORMATS.map((format) => (
        <source
          key={format.ext}
          srcSet={getImageUrl(imageId, format.ext)}
          type={format.type}
        />
      ))}
      <img
        src={getImageUrl(imageId, FALLBACK_FORMAT)}
        alt={alt}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}
