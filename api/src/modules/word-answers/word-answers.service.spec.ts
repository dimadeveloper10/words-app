import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { ExerciseType } from '../exercise-types/entities/exercise-type.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { User } from '../users/entities/user.entity';
import { Word } from '../words/entities/word.entity';
import { CreateWordAnswerDto } from './dto/create-word-answer.dto';
import { WordAnswerResponseDto } from './dto/word-answer-response.dto';
import { WordAnswer } from './entities/word-answer.entity';
import { WordAnswersService } from './word-answers.service';

function answer(id: string): CreateWordAnswerDto {
  return {
    id,
    wordId: 'word-id',
    lessonId: null,
    exerciseType: 'compile_word',
    isCorrect: true,
    pointsAwarded: 1,
    startedAt: '2026-11-05T10:00:00.000Z',
    answeredAt: '2026-11-05T10:00:05.000Z',
  };
}

describe('WordAnswersService.createMany', () => {
  const user = { id: 'user-id' } as User;
  let service: WordAnswersService;
  let create: jest.SpyInstance;

  beforeEach(() => {
    service = new WordAnswersService(
      {} as Repository<WordAnswer>,
      {} as Repository<Word>,
      {} as Repository<Lesson>,
      {} as Repository<ExerciseType>,
    );
    create = jest.spyOn(service, 'create');
  });

  it('saves every answer in order', async () => {
    create.mockResolvedValue({
      answer: {} as WordAnswerResponseDto,
      created: true,
    });

    const result = await service.createMany([answer('a'), answer('b')], user);

    expect(result).toEqual({ savedIds: ['a', 'b'], failed: [] });
    expect(
      create.mock.calls.map(([dto]) => (dto as CreateWordAnswerDto).id),
    ).toEqual(['a', 'b']);
  });

  it('keeps saving after per-answer HTTP errors and reports them', async () => {
    create
      .mockResolvedValueOnce({ answer: {}, created: false })
      .mockRejectedValueOnce(new NotFoundException('Word not found'))
      .mockRejectedValueOnce(
        new ConflictException('Answer ID is already used by another attempt'),
      )
      .mockResolvedValueOnce({ answer: {}, created: true });

    const result = await service.createMany(
      [answer('a'), answer('b'), answer('c'), answer('d')],
      user,
    );

    expect(result).toEqual({
      savedIds: ['a', 'd'],
      failed: [
        { id: 'b', statusCode: 404, message: 'Word not found' },
        {
          id: 'c',
          statusCode: 409,
          message: 'Answer ID is already used by another attempt',
        },
      ],
    });
  });

  it('rethrows unexpected errors so the client retries the batch', async () => {
    create
      .mockResolvedValueOnce({ answer: {}, created: true })
      .mockRejectedValueOnce(new Error('connection lost'));

    await expect(
      service.createMany([answer('a'), answer('b'), answer('c')], user),
    ).rejects.toThrow('connection lost');
    expect(create).toHaveBeenCalledTimes(2);
  });
});

describe('WordAnswersService.findAll', () => {
  const user = { id: 'user-id' } as User;

  it("returns the user's answers as a page of response DTOs", async () => {
    const startedAt = new Date('2026-11-05T10:00:00.000Z');
    const answeredAt = new Date('2026-11-05T10:00:05.000Z');
    const stored = {
      id: 'a',
      word: { id: 'word-id' },
      lesson: null,
      exerciseType: { id: 'type-id', type: 'compile_word' },
      isCorrect: true,
      pointsAwarded: 1,
      startedAt,
      answeredAt,
      createdAt: answeredAt,
    } as unknown as WordAnswer;
    const findAndCount = jest.fn().mockResolvedValue([[stored], 21]);
    const service = new WordAnswersService(
      { findAndCount } as unknown as Repository<WordAnswer>,
      {} as Repository<Word>,
      {} as Repository<Lesson>,
      {} as Repository<ExerciseType>,
    );

    const result = await service.findAll({ page: 2, limit: 20 }, user);

    expect(findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user: { id: 'user-id' } },
        order: { answeredAt: 'ASC', id: 'ASC' },
        take: 20,
        skip: 20,
      }),
    );
    expect(result).toEqual({
      items: [
        {
          id: 'a',
          wordId: 'word-id',
          lessonId: null,
          exerciseType: 'compile_word',
          isCorrect: true,
          pointsAwarded: 1,
          startedAt,
          answeredAt,
          createdAt: answeredAt,
        },
      ],
      total: 21,
      page: 2,
      limit: 20,
      totalPages: 2,
    });
  });
});

describe('WordAnswersService.create', () => {
  const user = { id: 'user-id' } as User;
  let findOne: jest.Mock;
  let insert: jest.Mock;
  let service: WordAnswersService;

  function stored(overrides: Partial<WordAnswer> = {}): WordAnswer {
    const dto = answer('a');
    return {
      id: 'a',
      user: { id: 'user-id' },
      word: { id: dto.wordId },
      lesson: null,
      exerciseType: { id: 'type-id', type: dto.exerciseType },
      isCorrect: dto.isCorrect,
      pointsAwarded: dto.pointsAwarded,
      startedAt: new Date(dto.startedAt),
      answeredAt: new Date(dto.answeredAt),
      createdAt: new Date(dto.answeredAt),
      ...overrides,
    } as unknown as WordAnswer;
  }

  function dbError(code: string): QueryFailedError {
    return new QueryFailedError(
      'INSERT',
      [],
      Object.assign(new Error(), { code }),
    );
  }

  beforeEach(() => {
    findOne = jest.fn();
    insert = jest.fn().mockResolvedValue(undefined);
    service = new WordAnswersService(
      { findOne, insert } as unknown as Repository<WordAnswer>,
      {
        existsBy: jest.fn().mockResolvedValue(true),
      } as unknown as Repository<Word>,
      {
        existsBy: jest.fn().mockResolvedValue(true),
      } as unknown as Repository<Lesson>,
      {
        findOneBy: jest.fn().mockResolvedValue({ id: 'type-id' }),
      } as unknown as Repository<ExerciseType>,
    );
  });

  it.each([
    ['an invalid startedAt', { startedAt: 'not-a-date' }],
    ['an invalid answeredAt', { answeredAt: 'not-a-date' }],
    ['startedAt after answeredAt', { startedAt: '2026-11-05T10:00:06.000Z' }],
  ])('rejects %s', async (_label, overrides) => {
    await expect(
      service.create({ ...answer('a'), ...overrides }, user),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(insert).not.toHaveBeenCalled();
  });

  it('inserts a new answer and reports it as created', async () => {
    findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(stored());

    const result = await service.create(answer('a'), user);

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'a',
        user: { id: 'user-id' },
        lesson: null,
      }),
    );
    expect(result).toMatchObject({
      answer: { id: 'a', lessonId: null },
      created: true,
    });
  });

  it('returns an identical stored answer without inserting', async () => {
    findOne.mockResolvedValueOnce(stored());

    const result = await service.create(
      { ...answer('a'), lessonId: undefined },
      user,
    );

    expect(result.created).toBe(false);
    expect(insert).not.toHaveBeenCalled();
  });

  it.each([
    ['another user', { user: { id: 'other-user' } }],
    ['another word', { word: { id: 'other-word' } }],
    ['another lesson', { lesson: { id: 'lesson-id' } }],
    ['another exercise type', { exerciseType: { id: 't', type: 'other' } }],
    ['another result', { isCorrect: false }],
    ['other points', { pointsAwarded: 2 }],
    ['another start time', { startedAt: new Date('2026-11-05T09:00:00.000Z') }],
    [
      'another answer time',
      { answeredAt: new Date('2026-11-05T10:00:06.000Z') },
    ],
  ])('rejects a reused ID that belongs to %s', async (_label, overrides) => {
    findOne.mockResolvedValueOnce(stored(overrides as Partial<WordAnswer>));

    await expect(service.create(answer('a'), user)).rejects.toThrow(
      'Answer ID is already used by another attempt',
    );
  });

  it('treats a concurrent duplicate insert as a retry', async () => {
    findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(stored());
    insert.mockRejectedValueOnce(dbError('23505'));

    const result = await service.create(answer('a'), user);

    expect(result.created).toBe(false);
  });

  it('maps a removed reference during insert to a conflict', async () => {
    findOne.mockResolvedValueOnce(null);
    insert.mockRejectedValueOnce(dbError('23503'));

    await expect(service.create(answer('a'), user)).rejects.toThrow(
      'An answer reference was removed during submission; reload and try again',
    );
  });

  it.each([
    ['a duplicate that has disappeared', dbError('23505')],
    ['another database error', dbError('23502')],
    ['a non-database error', new Error('connection lost')],
  ])('rethrows %s', async (_label, error) => {
    findOne.mockResolvedValue(null);
    insert.mockRejectedValueOnce(error);

    await expect(service.create(answer('a'), user)).rejects.toBe(error);
  });

  it('reports a conflict when the answer is gone right after insert', async () => {
    findOne.mockResolvedValue(null);

    await expect(service.create(answer('a'), user)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
