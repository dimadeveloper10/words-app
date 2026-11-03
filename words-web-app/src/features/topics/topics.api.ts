import { fetchAllPages } from '../../lib/fetchAllPages';
import type { Topic } from './topics.types';

export function getAllTopics(signal?: AbortSignal): Promise<Topic[]> {
  return fetchAllPages<Topic>('/topics', signal);
}
