import { api } from '@/lib/api';
import type { Paginated } from '@/types/pagination';
import type {
  CreateLessonPayload,
  Lesson,
  UpdateLessonPayload,
} from './lessons.types';

export async function createLesson(
  payload: CreateLessonPayload,
): Promise<Lesson> {
  const { data } = await api.post<Lesson>('/lessons', payload);
  return data;
}

export async function updateLesson(
  id: string,
  payload: UpdateLessonPayload,
): Promise<Lesson> {
  const { data } = await api.patch<Lesson>(`/lessons/${id}`, payload);
  return data;
}

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
