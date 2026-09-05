import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ImageOff, ImagePlus, RefreshCw, X } from 'lucide-react';
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
  currentExternalUrl?: string | null;
  alternativeInput: ReactNode;
}

export function ImageField({
  value,
  onChange,
  currentUrl,
  currentExternalUrl,
  alternativeInput,
}: ImageFieldProps) {
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
      : currentExternalUrl || null;

  return (
    <div className="grid gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={onFileChange}
      />
      <FormLabel>Image</FormLabel>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="grid gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-w-24 justify-center"
              onClick={() => inputRef.current?.click()}
            >
              {shownSrc ? (
                <RefreshCw className="size-4" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              {shownSrc ? 'Replace' : 'Choose image'}
            </Button>
            {preview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-w-24 justify-center"
                onClick={() => onChange(null)}
              >
                <X className="size-4" />
                Cancel
              </Button>
            )}
          </div>
          {alternativeInput}
        </div>

        {shownSrc ? (
          <img
            src={shownSrc}
            alt="Word image"
            className="size-20 rounded-md border object-cover"
          />
        ) : (
          <div className="bg-muted flex size-20 items-center justify-center rounded-md border">
            <ImageOff className="text-muted-foreground size-6" />
          </div>
        )}
      </div>
    </div>
  );
}
