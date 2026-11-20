import type { JSX } from 'react';
import { EntityImage } from '@/components/EntityImage';
import type { Word } from './words.types';

interface WordImageProps {
  word: Word;
  className?: string;
  iconClassName?: string;
}

export function WordImage({
  word,
  className,
  iconClassName,
}: WordImageProps): JSX.Element {
  return (
    <EntityImage
      imageId={word.imageId}
      alt={word.word}
      className={className}
      iconClassName={iconClassName}
    />
  );
}
