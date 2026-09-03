import { api } from '@/lib/api';
import type { Paginated } from '@/types/pagination';
import type { Word } from '@/features/words/words.types';
import type { Topic, TopicPayload } from './topics.types';

export async function createTopic(payload: TopicPayload): Promise<Topic> {
  const { data } = await api.post<Topic>('/topics', payload);
  return data;
}

export async function getTopic(id: string): Promise<Topic> {
  const { data } = await api.get<Topic>(`/topics/${id}`);
  return data;
}

export async function updateTopic(
  id: string,
  payload: TopicPayload,
): Promise<Topic> {
  const { data } = await api.patch<Topic>(`/topics/${id}`, payload);
  return data;
}

export interface ListTopicsParams {
  page: number;
  limit: number;
}

export async function listTopics(
  params: ListTopicsParams,
): Promise<Paginated<Topic>> {
  const { data } = await api.get<Paginated<Topic>>('/topics', { params });
  return data;
}

export async function deleteTopic(id: string): Promise<void> {
  await api.delete(`/topics/${id}`);
}

export async function listTopicWords(id: string): Promise<Word[]> {
  const { data } = await api.get<Word[]>(`/topics/${id}/words`);
  return data;
}

export async function addWordsToTopic(
  id: string,
  wordIds: string[],
): Promise<void> {
  await api.put(`/topics/${id}/add_words`, { wordIds });
}
