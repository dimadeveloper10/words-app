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
import type { Lesson } from './lessons.types';
import type { Paginated } from '@/types/pagination';
import type { Word } from '@/features/words/words.types';
import {
  createLesson,
  deleteLesson,
  getLesson,
  listLessons,
  listLessonWords,
  updateLesson,
} from './lessons.api';
import type { ListLessonsParams } from './lessons.api';
import {
  toCreateLessonPayload,
  toUpdateLessonPayload,
} from './lessons.schemas';
import type { LessonFormValues } from './lessons.schemas';

export function useLesson(id: string): UseQueryResult<Lesson> {
  return useQuery({
    queryKey: ['lessons', 'detail', id],
    queryFn: () => getLesson(id),
    retry: false,
  });
}

export function useLessonWords(id: string): UseQueryResult<Word[]> {
  return useQuery({
    queryKey: ['lessons', id, 'words'],
    queryFn: () => listLessonWords(id),
    retry: false,
  });
}

interface LessonMutationInput {
  values: LessonFormValues;
  imageId?: string;
}

export function useCreateLesson(): UseMutationResult<
  Lesson,
  Error,
  LessonMutationInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ values, imageId }: LessonMutationInput) =>
      createLesson({ ...toCreateLessonPayload(values), imageId }),
    onSuccess: (lesson) => {
      void queryClient.invalidateQueries({ queryKey: ['lessons'] });
      void queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success(`Lesson "${lesson.name}" created`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create lesson'));
    },
  });
}

export function useUpdateLesson(): UseMutationResult<
  Lesson,
  Error,
  LessonMutationInput & { id: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
      imageId,
    }: LessonMutationInput & { id: string }) =>
      updateLesson(id, { ...toUpdateLessonPayload(values), imageId }),
    onSuccess: (lesson) => {
      void queryClient.invalidateQueries({ queryKey: ['lessons'] });
      toast.success(`Lesson "${lesson.name}" updated`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update lesson'));
    },
  });
}

export function useUpdateLessonWords(): UseMutationResult<
  Lesson,
  Error,
  { id: string; wordIds: string[] }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, wordIds }: { id: string; wordIds: string[] }) =>
      updateLesson(id, { wordIds }),
    onSuccess: (lesson) => {
      void queryClient.invalidateQueries({ queryKey: ['lessons'] });
      void queryClient.invalidateQueries({ queryKey: ['words'] });
      void queryClient.invalidateQueries({
        queryKey: ['topics', lesson.topic.id, 'words'],
      });
      toast.success(`Words updated for "${lesson.name}"`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update lesson words'));
    },
  });
}

export function useLessons(
  params: ListLessonsParams,
): UseQueryResult<Paginated<Lesson>> {
  return useQuery({
    queryKey: ['lessons', params.page, params.limit, params.topicId],
    queryFn: () => listLessons(params),
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useDeleteLesson(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLesson,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['lessons'] });
      toast.success('Lesson deleted');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete lesson'));
    },
  });
}
