import { CACHE_MANAGER, type Cache } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { DictionaryApiEntry } from './interfaces/dictionary-api-response.interface';

const DICTIONARY_API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const DICTIONARY_TIMEOUT_MS = 30_000;
const TRANSCRIPTION_CACHE_TTL_MS = 24 * 60 * 60 * 1_000;

interface CachedTranscription {
  transcription: string | null;
}

@Injectable()
export class DictionaryService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findTranscription(word: string): Promise<string | null> {
    const normalizedWord = word.trim().toLowerCase();
    const cacheKey = `dictionary:transcription:${normalizedWord}`;
    const cached = await this.cacheManager.get<CachedTranscription>(cacheKey);

    if (cached !== undefined) {
      return cached.transcription;
    }

    try {
      const transcription = await this.fetchTranscription(normalizedWord);
      await this.cacheManager.set(
        cacheKey,
        { transcription },
        TRANSCRIPTION_CACHE_TTL_MS,
      );

      return transcription;
    } catch {
      throw new ServiceUnavailableException('Dictionary service unavailable');
    }
  }

  private async fetchTranscription(word: string): Promise<string | null> {
    const response = await fetch(
      `${DICTIONARY_API_URL}/${encodeURIComponent(word)}`,
      { signal: AbortSignal.timeout(DICTIONARY_TIMEOUT_MS) },
    );
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Dictionary API returned ${response.status}`);
    }

    const payload = (await response.json()) as DictionaryApiEntry[];
    return this.extractTranscription(payload);
  }

  private extractTranscription(payload: DictionaryApiEntry[]): string | null {
    if (!Array.isArray(payload)) {
      return null;
    }

    for (const item of payload) {
      if (typeof item.phonetic === 'string' && item.phonetic.trim()) {
        return item.phonetic.trim();
      }

      if (!Array.isArray(item.phonetics)) {
        continue;
      }
      const phonetic = item.phonetics.find(
        (candidate) =>
          typeof candidate.text === 'string' && candidate.text.trim(),
      );
      if (phonetic?.text) {
        return phonetic.text.trim();
      }
    }

    return null;
  }
}
