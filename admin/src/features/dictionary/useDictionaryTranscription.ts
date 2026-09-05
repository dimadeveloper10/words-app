import { useQuery } from '@tanstack/react-query';
import { getDictionaryTranscription } from './dictionary.api';

const TRANSCRIPTION_STALE_TIME_MS = 24 * 60 * 60 * 1_000;

export function useDictionaryTranscription(word: string, enabled: boolean) {
  const normalizedWord = word.trim().toLowerCase();

  return useQuery({
    queryKey: ['dictionary', 'transcription', normalizedWord],
    queryFn: ({ signal }) => getDictionaryTranscription(normalizedWord, signal),
    enabled: enabled && normalizedWord.length > 0,
    staleTime: TRANSCRIPTION_STALE_TIME_MS,
    retry: false,
  });
}
