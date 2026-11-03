import { api } from '../../lib/api';
import { fetchAllPages } from '../../lib/fetchAllPages';
import type { Word } from './words.types';

export function getAllWords(signal?: AbortSignal): Promise<Word[]> {
  return fetchAllPages<Word>('/words', signal);
}

export function getWordImageUrl(imageUrl: string) {
  return `${api.defaults.baseURL ?? ''}${imageUrl}`;
}
