import { api } from '../../lib/api';
import type { Paginated } from '../../types/pagination';
import type { Lesson } from './lessons.types';

export async function getAllLessons(
  topicId?: string,
  signal?: AbortSignal,
): Promise<Lesson[]> {
  const fetchPage = (page: number) =>
    api.get<Paginated<Lesson>>('/lessons', {
      params: { page, limit: 100, topicId },
      signal,
    });

  const { data: firstPage } = await fetchPage(1);
  const lessons = [...firstPage.items];

  for (let page = 2; page <= firstPage.totalPages; page++) {
    const { data } = await fetchPage(page);
    lessons.push(...data.items);
  }

  return lessons;
}
