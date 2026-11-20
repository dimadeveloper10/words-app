import {
  keepPreviousData,
  useMutation,
  type UseMutationResult,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/lib/api';
import type { Paginated } from '@/types/pagination';
import type { Word } from './words.types';
import {
  createWord,
  deleteWord,
  deleteWords,
  listWords,
  updateWord,
} from './words.api';
import type { ListWordsParams } from './words.api';
import { toWordPayload, type WordFormValues } from './words.schemas';

interface WordMutationInput {
  values: WordFormValues;
  imageId?: string;
}

export function useCreateWord(): UseMutationResult<
  Word,
  Error,
  WordMutationInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ values, imageId }: WordMutationInput) =>
      createWord({ ...toWordPayload(values), imageId }),
    onSuccess: (word) => {
      void queryClient.invalidateQueries({ queryKey: ['words'] });
      void queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success(`Word "${word.word}" created`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create word'));
    },
  });
}

export function useUpdateWord(): UseMutationResult<
  Word,
  Error,
  WordMutationInput & { id: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values, imageId }: WordMutationInput & { id: string }) =>
      updateWord(id, { ...toWordPayload(values), imageId }),
    onSuccess: (word) => {
      void queryClient.invalidateQueries({ queryKey: ['words'] });
      void queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success(`Word "${word.word}" updated`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update word'));
    },
  });
}

export function useWords(
  params: ListWordsParams,
): UseQueryResult<Paginated<Word>> {
  return useQuery({
    queryKey: ['words', params.q ?? '', params.page, params.limit],
    queryFn: () => listWords(params),
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useDeleteWord(): UseMutationResult<void, Error, string> {
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

export function useDeleteWords(): UseMutationResult<void, Error, string[]> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWords,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['words'] });
      void queryClient.invalidateQueries({ queryKey: ['topics'] });
      void queryClient.invalidateQueries({ queryKey: ['lessons'] });
      toast.success('Words deleted');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete words'));
    },
  });
}
