import { api } from '@/lib/api';

export interface DictionaryTranscriptionResponse {
  transcription: string | null;
}

export async function getDictionaryTranscription(
  word: string,
  signal?: AbortSignal,
): Promise<DictionaryTranscriptionResponse> {
  const { data } = await api.get<DictionaryTranscriptionResponse>(
    '/dictionary/transcription',
    { params: { word }, signal },
  );
  return data;
}
