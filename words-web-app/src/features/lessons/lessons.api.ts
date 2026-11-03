import { fetchAllPages } from '../../lib/fetchAllPages';
import type { Lesson } from './lessons.types';

export function getAllLessons(signal?: AbortSignal): Promise<Lesson[]> {
  return fetchAllPages<Lesson>('/lessons', signal);
}
