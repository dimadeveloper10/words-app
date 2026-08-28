import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/lib/api';
import {
  createWord,
  deleteWord,
  listWords,
  updateWord,
  uploadWordImage,
} from './words.api';
import type { ListWordsParams } from './words.api';
import { toWordPayload, type WordFormValues } from './words.schemas';

export function useCreateWord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: WordFormValues) => createWord(toWordPayload(values)),
    onSuccess: (word) => {
      void queryClient.invalidateQueries({ queryKey: ['words'] });
      toast.success(`Word "${word.word}" created`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create word'));
    },
  });
}

export function useUpdateWord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: WordFormValues }) =>
      updateWord(id, toWordPayload(values)),
    onSuccess: (word) => {
      void queryClient.invalidateQueries({ queryKey: ['words'] });
      toast.success(`Word "${word.word}" updated`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update word'));
    },
  });
}

export function useUploadWordImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadWordImage(id, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['words'] });
    },
  });
}

export function useWords(params: ListWordsParams) {
  return useQuery({
    queryKey: ['words', params.q ?? '', params.page, params.limit],
    queryFn: () => listWords(params),
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useDeleteWord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWord(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['words'] });
      toast.success('Word deleted');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete word'));
    },
  });
}
