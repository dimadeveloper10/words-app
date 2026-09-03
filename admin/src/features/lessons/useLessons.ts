import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/lib/api';
import { deleteLesson, listLessons } from './lessons.api';
import type { ListLessonsParams } from './lessons.api';

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
