import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/lib/api';
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

export function useLesson(id: string) {
  return useQuery({
    queryKey: ['lessons', 'detail', id],
    queryFn: () => getLesson(id),
    retry: false,
  });
}

export function useLessonWords(id: string) {
  return useQuery({
    queryKey: ['lessons', id, 'words'],
    queryFn: () => listLessonWords(id),
    retry: false,
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: LessonFormValues) =>
      createLesson(toCreateLessonPayload(values)),
    onSuccess: (lesson) => {
      void queryClient.invalidateQueries({ queryKey: ['lessons'] });
      toast.success(`Lesson "${lesson.name}" created`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create lesson'));
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: LessonFormValues }) =>
      updateLesson(id, toUpdateLessonPayload(values)),
    onSuccess: (lesson) => {
      void queryClient.invalidateQueries({ queryKey: ['lessons'] });
      toast.success(`Lesson "${lesson.name}" updated`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update lesson'));
    },
  });
}

export function useLessons(params: ListLessonsParams) {
  return useQuery({
    queryKey: ['lessons', params.page, params.limit, params.topicId],
    queryFn: () => listLessons(params),
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useDeleteLesson() {
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
