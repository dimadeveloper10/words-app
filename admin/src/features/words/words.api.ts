import { api } from '@/lib/api';
import type { Paginated } from '@/types/pagination';
import type { Word, WordPayload } from './words.types';

export async function createWord(payload: WordPayload): Promise<Word> {
  const { data } = await api.post<Word>('/words', payload);
  return data;
}

export async function updateWord(
  id: string,
  payload: WordPayload,
): Promise<Word> {
  const { data } = await api.patch<Word>(`/words/${id}`, payload);
  return data;
}

export interface ListWordsParams {
  q?: string;
  page: number;
  limit: number;
}

export async function listWords(
  params: ListWordsParams,
): Promise<Paginated<Word>> {
  const { data } = await api.get<Paginated<Word>>('/words', { params });
  return data;
}

export async function deleteWord(id: string): Promise<void> {
  await api.delete(`/words/${id}`);
}

export async function uploadWordImage(id: string, file: File): Promise<Word> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<Word>(`/words/${id}/image`, formData);
  return data;
}
