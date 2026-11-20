import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ImagesService } from '../images/images.service';
import { LessonsService } from '../lessons/lessons.service';
import { Topic } from '../topics/entities/topic.entity';
import { WordExample } from './entities/word-example.entity';
import { WordForm } from './entities/word-form.entity';
import { WordTranslation } from './entities/word-translation.entity';
import { Word } from './entities/word.entity';
import { WordsService } from './words.service';
import { PartOfSpeech } from '../../common/enums/part-of-speech.enum';

type QueryBuilderMock = Record<
  | 'select'
  | 'orderBy'
  | 'addOrderBy'
  | 'take'
  | 'skip'
  | 'where'
  | 'getManyAndCount',
  jest.Mock
>;

type ManagerMock = {
  delete: jest.Mock;
  save: jest.Mock;
  getRepository: jest.Mock;
};

type SetupContext = {
  service: WordsService;
  queryBuilder: QueryBuilderMock;
  findTopics: jest.Mock;
  manager: ManagerMock;
  wordsRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
    manager: { transaction: jest.Mock };
  };
  lessons: { removeWordFromTopicLessons: jest.Mock };
  images: { ensureExists: jest.Mock; deleteIfReplaced: jest.Mock };
};

function setup(): SetupContext {
  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };
  const findTopics = jest.fn();
  const manager = {
    delete: jest.fn().mockResolvedValue(undefined),
    save: jest.fn().mockResolvedValue(undefined),
    getRepository: jest.fn(() => ({ find: findTopics })),
  };
  const wordsRepository = {
    find: jest.fn(),
    findOne: jest.fn().mockResolvedValue(null),
    createQueryBuilder: jest.fn(() => queryBuilder),
    manager: {
      transaction: jest.fn((work: (m: typeof manager) => Promise<unknown>) =>
        work(manager),
      ),
    },
  };
  const lessons = { removeWordFromTopicLessons: jest.fn() };
  const images = {
    ensureExists: jest.fn().mockResolvedValue(undefined),
    deleteIfReplaced: jest.fn().mockResolvedValue(undefined),
  };
  const service = new WordsService(
    wordsRepository as unknown as Repository<Word>,
    lessons as unknown as LessonsService,
    images as unknown as ImagesService,
  );
  return {
    service,
    queryBuilder,
    findTopics,
    manager,
    wordsRepository,
    lessons,
    images,
  };
}

describe('WordsService.findAll', () => {
  it('returns an empty page without loading details', async () => {
    const { service, queryBuilder, wordsRepository } = setup();
    queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    const result = await service.findAll({ page: 1, limit: 20 });

    expect(result).toEqual({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(queryBuilder.where).not.toHaveBeenCalled();
    expect(wordsRepository.find).not.toHaveBeenCalled();
  });

  it('pages ids first, then loads full words in the same order', async () => {
    const { service, queryBuilder, wordsRepository } = setup();
    queryBuilder.getManyAndCount.mockResolvedValue([
      [{ id: 'w1' }, { id: 'w2' }],
      22,
    ]);
    const words = [{ id: 'w1' }, { id: 'w2' }];
    wordsRepository.find.mockResolvedValue(words);

    const result = await service.findAll({ page: 2, limit: 20, q: '  50% ' });

    expect(queryBuilder.take).toHaveBeenCalledWith(20);
    expect(queryBuilder.skip).toHaveBeenCalledWith(20);
    expect(queryBuilder.where).toHaveBeenCalledWith(expect.any(String), {
      q: '%50\\%%',
    });
    expect(wordsRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        relations: {
          translations: true,
          forms: true,
          examples: true,
          topics: true,
          lessons: true,
        },
        order: {
          createdAt: 'ASC',
          id: 'ASC',
          translations: { isPrimary: 'DESC', sortOrder: 'ASC' },
          forms: { sortOrder: 'ASC' },
          examples: { sortOrder: 'ASC' },
          topics: { sortOrder: 'ASC', name: 'ASC', id: 'ASC' },
          lessons: { lessonNumber: 'ASC', name: 'ASC', id: 'ASC' },
        },
      }),
    );
    expect(result).toEqual({
      items: words,
      total: 22,
      page: 2,
      limit: 20,
      totalPages: 2,
    });
  });

  it('ignores a blank search term', async () => {
    const { service, queryBuilder } = setup();
    queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await service.findAll({ page: 1, limit: 20, q: '   ' });

    expect(queryBuilder.where).not.toHaveBeenCalled();
  });
});

describe('WordsService.update', () => {
  function storedWord(): Word {
    return {
      id: 'word-id',
      word: 'run',
      transcription: 'rʌn',
      imageId: 'old-image',
      topics: [{ id: 't1' }, { id: 't2' }] as Topic[],
      translations: [],
      forms: [],
      examples: [],
    } as unknown as Word;
  }

  it('changes nothing when the payload is empty', async () => {
    const ctx = setup();
    const word = storedWord();
    jest.spyOn(ctx.service, 'findOne').mockResolvedValue(word);

    await ctx.service.update('word-id', {});

    expect(ctx.manager.delete).not.toHaveBeenCalled();
    expect(ctx.lessons.removeWordFromTopicLessons).not.toHaveBeenCalled();
    expect(ctx.manager.save).toHaveBeenCalledWith(storedWord());
    expect(ctx.images.ensureExists).not.toHaveBeenCalled();
    expect(ctx.images.deleteIfReplaced).toHaveBeenCalledWith(
      'old-image',
      'old-image',
    );
  });

  it('applies every provided field and replaces collections', async () => {
    const ctx = setup();
    const word = storedWord();
    const findOne = jest.spyOn(ctx.service, 'findOne').mockResolvedValue(word);
    ctx.findTopics.mockResolvedValue([{ id: 't2' }, { id: 't3' }]);

    const result = await ctx.service.update('word-id', {
      word: '  Sprint ',
      transcription: 'sprɪnt',
      imageId: 'new-image',
      topicIds: ['t2', 't3'],
      translations: [{ partOfSpeech: PartOfSpeech.VERB, text: ' бігти ' }],
      forms: [{ form: ' sprinted ' }],
      examples: [{ text: ' I sprint. ' }],
    });

    expect(ctx.images.ensureExists).toHaveBeenCalledWith('new-image');
    expect(ctx.lessons.removeWordFromTopicLessons).toHaveBeenCalledWith(
      ctx.manager,
      'word-id',
      ['t1'],
    );
    expect(
      ctx.manager.delete.mock.calls.map(([entity]: unknown[]) => entity),
    ).toEqual([WordTranslation, WordForm, WordExample]);
    expect(ctx.manager.save).toHaveBeenCalledWith(
      expect.objectContaining({
        word: 'sprint',
        transcription: 'sprɪnt',
        imageId: 'new-image',
        topics: [{ id: 't2' }, { id: 't3' }],
        translations: [
          expect.objectContaining({ text: 'бігти', isPrimary: false }),
        ],
        forms: [expect.objectContaining({ form: 'sprinted' })],
        examples: [expect.objectContaining({ text: 'I sprint.' })],
      }),
    );
    expect(ctx.images.deleteIfReplaced).toHaveBeenCalledWith(
      'old-image',
      'new-image',
    );
    expect(findOne).toHaveBeenCalledTimes(2);
    expect(result).toBe(word);
  });

  it('clears the image when null is sent', async () => {
    const ctx = setup();
    jest.spyOn(ctx.service, 'findOne').mockResolvedValue(storedWord());

    await ctx.service.update('word-id', { imageId: null });

    expect(ctx.manager.save).toHaveBeenCalledWith(
      expect.objectContaining({ transcription: 'rʌn', imageId: null }),
    );
    expect(ctx.images.deleteIfReplaced).toHaveBeenCalledWith('old-image', null);
  });

  it('rejects a headword used by another word', async () => {
    const ctx = setup();
    jest.spyOn(ctx.service, 'findOne').mockResolvedValue(storedWord());
    ctx.wordsRepository.findOne.mockResolvedValue({ id: 'other' });

    await expect(
      ctx.service.update('word-id', { word: 'walk' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(ctx.manager.save).not.toHaveBeenCalled();
  });
});
