import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
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
