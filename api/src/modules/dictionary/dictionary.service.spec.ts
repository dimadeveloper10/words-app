import { ServiceUnavailableException } from '@nestjs/common';
import type { Cache } from '@nestjs/cache-manager';
import { DictionaryService } from './dictionary.service';

describe('DictionaryService.findTranscription', () => {
  let cache: { get: jest.Mock; set: jest.Mock };
  let fetchMock: jest.SpyInstance;
  let service: DictionaryService;

  function respond(status: number, body: unknown = []): void {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status }));
  }

  beforeEach(() => {
    cache = {
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue(undefined),
    };
    fetchMock = jest.spyOn(global, 'fetch');
    service = new DictionaryService(cache as unknown as Cache);
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it('returns a cached value without calling the API', async () => {
    cache.get.mockResolvedValue({ transcription: null });

    await expect(service.findTranscription(' Run ')).resolves.toBeNull();
    expect(cache.get).toHaveBeenCalledWith('dictionary:transcription:run');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fetches, extracts and caches the transcription', async () => {
    respond(200, [{ phonetic: ' /rʌn/ ' }]);

    await expect(service.findTranscription('Run')).resolves.toBe('/rʌn/');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.dictionaryapi.dev/api/v2/entries/en/run',
      expect.objectContaining({ signal: expect.any(AbortSignal) as unknown }),
    );
    expect(cache.set).toHaveBeenCalledWith(
      'dictionary:transcription:run',
      { transcription: '/rʌn/' },
      86_400_000,
    );
  });

  it('falls back to the phonetics list', async () => {
    respond(200, [{ phonetics: [{ text: '' }, { text: '/ˈwɔːtə/' }] }]);

    await expect(service.findTranscription('water')).resolves.toBe('/ˈwɔːtə/');
  });

  it('caches null when the word is unknown', async () => {
    respond(404, { title: 'No Definitions Found' });

    await expect(service.findTranscription('qwzx')).resolves.toBeNull();
    expect(cache.set).toHaveBeenCalledWith(
      'dictionary:transcription:qwzx',
      { transcription: null },
      86_400_000,
    );
  });

  it.each([
    ['the API fails', () => respond(500)],
    ['the network fails', () => fetchMock.mockRejectedValue(new Error('x'))],
    [
      'caching fails',
      () => {
        respond(200, [{ phonetic: '/rʌn/' }]);
        cache.set.mockRejectedValue(new Error('redis down'));
      },
    ],
  ])('reports 503 when %s', async (_label, arrange) => {
    arrange();

    await expect(service.findTranscription('run')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('encodes the word in the URL', async () => {
    respond(404);

    await service.findTranscription('ice cream');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.dictionaryapi.dev/api/v2/entries/en/ice%20cream',
      expect.anything(),
    );
  });
});
