import { useEffect, useRef, useState } from 'react';
import { ImagePlus, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Only JPEG or PNG images are allowed.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Image must be 2 MB or smaller.';
  }
  return null;
}

interface ImageFieldProps {
  value: File | null;
  onChange: (file: File | null) => void;
  currentUrl?: string | null;
}

export function ImageField({ value, onChange, currentUrl }: ImageFieldProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }

    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (file) {
      const error = validateImageFile(file);
      if (error) {
        toast.error(error);
        e.target.value = '';
        return;
      }
    }

    onChange(file);
  };

  const shownSrc = preview
    ? preview
    : currentUrl
      ? `${import.meta.env.VITE_API_URL}${currentUrl}`
      : null;

  return (
    <div className="space-y-2">
      <FormLabel>Image (optional)</FormLabel>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={onFileChange}
      />
      {shownSrc ? (
        <div className="flex flex-wrap items-center gap-3">
          <img
            src={shownSrc}
            alt="Word image"
            className="size-16 rounded-md border object-cover"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <RefreshCw className="size-4" />
            Replace
          </Button>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(null)}
            >
              <X className="size-4" />
              Cancel
            </Button>
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="size-4" />
          Choose image
        </Button>
      )}
    </div>
  );
}
