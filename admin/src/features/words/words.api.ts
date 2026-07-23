import { api } from '@/lib/api';
import type { CreateWordPayload, Word } from './words.types';

export async function createWord(payload: CreateWordPayload): Promise<Word> {
  const { data } = await api.post<Word>('/words', payload);
  return data;
}

export async function listWords(): Promise<Word[]> {
  const { data } = await api.get<Word[]>('/words');
  return data;
}

export async function deleteWord(id: string): Promise<void> {
  await api.delete(`/words/${id}`);
}
