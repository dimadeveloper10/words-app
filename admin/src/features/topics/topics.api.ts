import { api } from '@/lib/api';
import type { Paginated } from '@/types/pagination';
import type { Topic } from './topics.types';

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
