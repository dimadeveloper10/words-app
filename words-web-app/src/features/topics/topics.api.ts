import { api } from '../../lib/api';
import type { Paginated } from '../../types/pagination';
import type { Topic } from './topics.types';

export async function getAllTopics(signal?: AbortSignal): Promise<Topic[]> {
  const { data: firstPage } = await api.get<Paginated<Topic>>('/topics', {
    params: { page: 1, limit: 100 },
    signal,
  });
  const topics = [...firstPage.items];

  for (let page = 2; page <= firstPage.totalPages; page++) {
    const { data } = await api.get<Paginated<Topic>>('/topics', {
      params: { page, limit: 100 },
      signal,
    });
    topics.push(...data.items);
  }

  return topics;
}

export async function getTopic(
  id: string,
  signal?: AbortSignal,
): Promise<Topic> {
  const { data } = await api.get<Topic>(`/topics/${id}`, { signal });
  return data;
}
