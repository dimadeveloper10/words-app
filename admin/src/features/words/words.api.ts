import { api } from '@/lib/api';
import type { CreateWordPayload, Word } from './words.types';

export async function createWord(payload: CreateWordPayload): Promise<Word> {
  const { data } = await api.post<Word>('/words', payload);
  return data;
}

export async function listWords(q?: string): Promise<Word[]> {
  const { data } = await api.get<Word[]>('/words', {
    params: q ? { q } : undefined,
  });
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
