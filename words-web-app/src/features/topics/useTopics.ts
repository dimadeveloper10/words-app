import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllTopics, getTopic } from './topics.api';
import type { Topic } from './topics.types';

export function useTopics() {
  return useQuery({
    queryKey: ['topics', 'all'],
    queryFn: ({ signal }) => getAllTopics(signal),
    staleTime: 60_000,
  });
}

export function useTopic(id: string) {
  const queryClient = useQueryClient();
  const cachedTopic = queryClient
    .getQueryData<Topic[]>(['topics', 'all'])
    ?.find((topic) => topic.id === id);

  return useQuery({
    queryKey: ['topics', id],
    queryFn: ({ signal }) => getTopic(id, signal),
    staleTime: 60_000,
    placeholderData: cachedTopic,
  });
}
