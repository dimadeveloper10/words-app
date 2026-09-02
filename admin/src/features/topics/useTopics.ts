import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/lib/api';
import { deleteTopic, listTopics } from './topics.api';
import type { ListTopicsParams } from './topics.api';

export function useTopics(params: ListTopicsParams) {
  return useQuery({
    queryKey: ['topics', params.page, params.limit],
    queryFn: () => listTopics(params),
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTopic(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success('Topic deleted');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete topic'));
    },
  });
}
