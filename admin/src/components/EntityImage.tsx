import { ImageOff } from 'lucide-react';

import { getImageUrl } from '@/lib/images';
import { cn } from '@/lib/utils';

interface EntityImageProps {
  imageId: string | null;
  alt: string;
  className?: string;
  iconClassName?: string;
}

export function EntityImage({
  imageId,
  alt,
  className,
  iconClassName,
}: EntityImageProps) {
  if (!imageId) {
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
      src={getImageUrl(imageId)}
      alt={alt}
      className={cn('rounded-md object-cover', className)}
    />
  );
}
