import { ImageOff } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Word } from './words.types';

interface WordImageProps {
  word: Word;
  className?: string;
  iconClassName?: string;
}

export function WordImage({ word, className, iconClassName }: WordImageProps) {
  const src = word.imageUrl
    ? `${import.meta.env.VITE_API_URL}${word.imageUrl}`
    : word.externalUrl;

  if (!src) {
    return (
      <div
        className={cn(
          'bg-muted flex items-center justify-center rounded-md',
          className,
        )}
      >
        <ImageOff
          className={cn('text-muted-foreground size-4', iconClassName)}
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={word.word}
      className={cn('rounded-md object-cover', className)}
    />
  );
}
