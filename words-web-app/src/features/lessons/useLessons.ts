import { useQuery } from '@tanstack/react-query';
import { getAllLessons } from './lessons.api';

export function useLessons() {
  return useQuery({
    queryKey: ['lessons', 'all'],
    queryFn: ({ signal }) => getAllLessons(signal),
    staleTime: 60_000,
  });
}
