import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/lib/api';
import { uploadImage } from './images.api';

export function useUploadImage() {
  return useMutation({
    mutationFn: uploadImage,
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to upload image'));
    },
  });
}
