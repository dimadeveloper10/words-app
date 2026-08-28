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
  uploadWordImage,
} from './words.api';
import type { ListWordsParams } from './words.api';
import type { CreateWordValues } from './words.schemas';

export function useCreateWord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateWordValues) =>
      createWord({
        word: values.word,
        transcription: values.transcription || undefined,
        translations: values.translations.map((t, index) => ({
          partOfSpeech: t.partOfSpeech,
          text: t.text,
          isPrimary: t.isPrimary,
          sortOrder: index,
        })),
        forms: values.forms.length
          ? values.forms.map((f, index) => ({
              form: f.form,
              sortOrder: index,
            }))
          : undefined,
        examples: values.examples.length
          ? values.examples.map((e, index) => ({
              text: e.text,
              translation: e.translation || undefined,
              sortOrder: index,
            }))
          : undefined,
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
