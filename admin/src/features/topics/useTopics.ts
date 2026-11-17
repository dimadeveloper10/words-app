import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/lib/api';
import {
  addWordsToTopic,
  createTopic,
  deleteTopic,
  getTopic,
  listTopicWords,
  listTopics,
  updateTopic,
} from './topics.api';
import type { ListTopicsParams } from './topics.api';
import { toTopicPayload } from './topics.schemas';
import type { TopicFormValues } from './topics.schemas';

export function useAddWordsToTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      topicId,
      wordIds,
    }: {
      topicId: string;
      wordIds: string[];
    }) => addWordsToTopic(topicId, wordIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['words'] });
      void queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success('Words added to topic');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to add words to topic'));
    },
  });
}

export function useTopicWords(id: string) {
  return useQuery({
    queryKey: ['topics', id, 'words'],
    queryFn: () => listTopicWords(id),
    retry: false,
  });
}

export function useTopic(id: string) {
  return useQuery({
    queryKey: ['topics', 'detail', id],
    queryFn: () => getTopic(id),
    retry: false,
  });
}

interface TopicMutationInput {
  values: TopicFormValues;
  imageId?: string;
}

export function useCreateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ values, imageId }: TopicMutationInput) =>
      createTopic({ ...toTopicPayload(values), imageId }),
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
    mutationFn: ({
      id,
      values,
      imageId,
    }: TopicMutationInput & { id: string }) =>
      updateTopic(id, { ...toTopicPayload(values), imageId }),
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
