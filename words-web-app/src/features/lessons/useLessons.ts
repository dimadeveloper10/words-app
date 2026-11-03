import { useQuery } from '@tanstack/react-query';
import { getAllLessons } from './lessons.api';

export function useLessons(topicId?: string) {
  return useQuery({
    queryKey: ['lessons', topicId ?? 'all'],
    queryFn: ({ signal }) => getAllLessons(topicId, signal),
    staleTime: 60_000,
  });
}
