import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/lib/api';
import { createWord, deleteWord, listWords } from './words.api';
import type { CreateWordValues } from './words.schemas';

export function useCreateWord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateWordValues) =>
      createWord({
        word: values.word,
        transcription: values.transcription || undefined,
        imageUrl: values.imageUrl || undefined,
        translations: values.translations.map((t, index) => ({
          partOfSpeech: t.partOfSpeech,
          text: t.text,
          isPrimary: t.isPrimary,
          sortOrder: index,
        })),
      }),
    onSuccess: (word) => {
      void queryClient.invalidateQueries({ queryKey: ['words'] });
      toast.success(`Word "${word.word}" created`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create word'));
    },
  });
}

export function useWords() {
  return useQuery({
    queryKey: ['words'],
    queryFn: listWords,
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
