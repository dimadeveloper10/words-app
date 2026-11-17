import { api } from '../../lib/api';
import { fetchAllPages } from '../../lib/fetchAllPages';
import type { Word } from './words.types';

export function getAllWords(signal?: AbortSignal): Promise<Word[]> {
  return fetchAllPages<Word>('/words', signal);
}

export function getWordImageUrl(imageId: string) {
  return `${api.defaults.baseURL ?? ''}/static/images/${imageId}.webp`;
}
