import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { DictionaryApiEntry } from './interfaces/dictionary-api-response.interface';

const DICTIONARY_API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const DICTIONARY_TIMEOUT_MS = 30_000;

@Injectable()
export class DictionaryService {
  async findTranscription(word: string): Promise<string | null> {
    const normalizedWord = word.trim().toLowerCase();

    try {
      const response = await fetch(
        `${DICTIONARY_API_URL}/${encodeURIComponent(normalizedWord)}`,
        { signal: AbortSignal.timeout(DICTIONARY_TIMEOUT_MS) },
      );

      if (response.status === 404) return null;
      if (!response.ok) {
        throw new Error(`Dictionary API returned ${response.status}`);
      }

      const payload = (await response.json()) as DictionaryApiEntry[];
      return this.extractTranscription(payload);
    } catch {
      throw new ServiceUnavailableException('Dictionary service unavailable');
    }
  }

  private extractTranscription(payload: DictionaryApiEntry[]): string | null {
    if (!Array.isArray(payload)) return null;

    for (const item of payload) {
      if (typeof item.phonetic === 'string' && item.phonetic.trim()) {
        return item.phonetic.trim();
      }

      if (!Array.isArray(item.phonetics)) continue;
      const phonetic = item.phonetics.find(
        (candidate) =>
          typeof candidate.text === 'string' && candidate.text.trim(),
      );
      if (phonetic?.text) return phonetic.text.trim();
    }

    return null;
  }
}
