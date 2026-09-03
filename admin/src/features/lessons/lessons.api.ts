import { api } from '@/lib/api';
import type { Paginated } from '@/types/pagination';
import type { Lesson } from './lessons.types';

export interface ListLessonsParams {
  page: number;
  limit: number;
  topicId?: string;
}

export async function listLessons(
  params: ListLessonsParams,
): Promise<Paginated<Lesson>> {
  const { data } = await api.get<Paginated<Lesson>>('/lessons', { params });
  return data;
}

export async function deleteLesson(id: string): Promise<void> {
  await api.delete(`/lessons/${id}`);
}
