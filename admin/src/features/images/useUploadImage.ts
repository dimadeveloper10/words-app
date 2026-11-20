import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/lib/api';
import { uploadImage } from './images.api';

export function useUploadImage(): UseMutationResult<string, Error, File> {
  return useMutation({
    mutationFn: uploadImage,
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to upload image'));
    },
  });
}
