import { api } from '../../lib/api';
import type { Paginated } from '../../types/pagination';
import type { Lesson } from './lessons.types';

export async function getAllLessons(signal?: AbortSignal): Promise<Lesson[]> {
  const { data: firstPage } = await api.get<Paginated<Lesson>>('/lessons', {
    params: { page: 1, limit: 100 },
    signal,
  });
  const lessons = [...firstPage.items];

  for (let page = 2; page <= firstPage.totalPages; page++) {
    const { data } = await api.get<Paginated<Lesson>>('/lessons', {
      params: { page, limit: 100 },
      signal,
    });
    lessons.push(...data.items);
  }

  return lessons;
}
