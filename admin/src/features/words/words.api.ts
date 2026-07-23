import { api } from '@/lib/api';
import type { CreateWordPayload, Word } from './words.types';

export async function createWord(payload: CreateWordPayload): Promise<Word> {
  const { data } = await api.post<Word>('/words', payload);
  return data;
}
