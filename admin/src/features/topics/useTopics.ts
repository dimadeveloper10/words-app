import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/lib/api';
import {
  createTopic,
  deleteTopic,
  listTopicWords,
  listTopics,
  updateTopic,
} from './topics.api';
import type { ListTopicsParams } from './topics.api';
import { toTopicPayload } from './topics.schemas';
import type { TopicFormValues } from './topics.schemas';

export function useTopicWords(id: string) {
  return useQuery({
    queryKey: ['topics', id, 'words'],
    queryFn: () => listTopicWords(id),
    retry: false,
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: TopicFormValues) =>
      createTopic(toTopicPayload(values)),
    onSuccess: (topic) => {
      void queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success(`Topic "${topic.name}" created`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create topic'));
    },
  });
}

export function useUpdateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: TopicFormValues }) =>
      updateTopic(id, toTopicPayload(values)),
    onSuccess: (topic) => {
      void queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success(`Topic "${topic.name}" updated`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update topic'));
    },
  });
}

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
