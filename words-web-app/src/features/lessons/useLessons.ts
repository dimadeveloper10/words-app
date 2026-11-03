import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllLessons, getLesson } from './lessons.api';
import type { Lesson } from './lessons.types';

export function useLessons(topicId?: string) {
  return useQuery({
    queryKey: ['lessons', topicId ?? 'all'],
    queryFn: ({ signal }) => getAllLessons(topicId, signal),
    staleTime: 60_000,
  });
}

export function useLesson(id: string) {
  const queryClient = useQueryClient();
  const cachedLesson = queryClient
    .getQueriesData<Lesson[]>({ queryKey: ['lessons'] })
    .flatMap(([, lessons]) => (Array.isArray(lessons) ? lessons : []))
    .find((lesson) => lesson.id === id);

  return useQuery({
    queryKey: ['lesson', id],
    queryFn: ({ signal }) => getLesson(id, signal),
    staleTime: 60_000,
    placeholderData: cachedLesson,
  });
}
