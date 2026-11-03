import { useQuery } from '@tanstack/react-query';
import { getAllTopics } from './topics.api';

export function useTopics() {
  return useQuery({
    queryKey: ['topics', 'all'],
    queryFn: ({ signal }) => getAllTopics(signal),
    staleTime: 60_000,
  });
}
