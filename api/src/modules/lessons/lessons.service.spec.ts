import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ImagesService } from '../images/images.service';
import { Topic } from '../topics/entities/topic.entity';
import { Word } from '../words/entities/word.entity';
import { Lesson } from './entities/lesson.entity';
import { LessonsService } from './lessons.service';

describe('LessonsService.update', () => {
  function storedLesson(): Lesson {
    return {
      id: 'lesson-id',
      name: 'Breakfast',
      slug: 'breakfast',
      lessonNumber: 1,
      imageId: 'old-image',
      topic: { id: 'topic-id' },
      words: [],
    } as unknown as Lesson;
  }

  function setup(lesson: Lesson | null = storedLesson()) {
    const lessonsRepo = {
      findOne: jest.fn().mockResolvedValueOnce(lesson).mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const wordsRepo = { find: jest.fn() };
    const manager = {
      getRepository: jest.fn((entity: unknown) =>
        entity === Lesson ? lessonsRepo : wordsRepo,
      ),
    };
    const images = {
      ensureExists: jest.fn().mockResolvedValue(undefined),
      deleteIfReplaced: jest.fn().mockResolvedValue(undefined),
    };
    const service = new LessonsService(
      {
        manager: {
          transaction: jest.fn(
            (work: (m: typeof manager) => Promise<unknown>) => work(manager),
          ),
        },
      } as unknown as Repository<Lesson>,
      {} as Repository<Topic>,
      {} as Repository<Word>,
      images as unknown as ImagesService,
    );
    const findOne = jest
      .spyOn(service, 'findOne')
      .mockResolvedValue({ id: 'lesson-id' } as Lesson);
    return { service, lessonsRepo, wordsRepo, images, findOne };
  }

  it('throws when the lesson does not exist', async () => {
    const ctx = setup(null);

    await expect(ctx.service.update('lesson-id', {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(ctx.lessonsRepo.save).not.toHaveBeenCalled();
  });

  it('changes nothing when the payload is empty', async () => {
    const ctx = setup();

    await ctx.service.update('lesson-id', {});

    expect(ctx.lessonsRepo.findOne).toHaveBeenCalledTimes(1);
    expect(ctx.lessonsRepo.save).toHaveBeenCalledWith(storedLesson());
    expect(ctx.images.ensureExists).not.toHaveBeenCalled();
    expect(ctx.images.deleteIfReplaced).toHaveBeenCalledWith(
      'old-image',
      'old-image',
    );
  });

  it('normalizes and applies every provided field', async () => {
    const ctx = setup();
    const words = [{ id: 'w1', topics: [{ id: 'topic-id' }] }];
    ctx.wordsRepo.find.mockResolvedValue(words);

    const result = await ctx.service.update('lesson-id', {
      name: '  Lunch ',
      slug: ' Lunch Time! ',
      lessonNumber: 2,
      imageId: 'new-image',
      wordIds: ['w1'],
    });

    expect(ctx.images.ensureExists).toHaveBeenCalledWith('new-image');
    expect(ctx.lessonsRepo.findOne).toHaveBeenCalledTimes(3);
    expect(ctx.lessonsRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Lunch',
        slug: 'lunch-time',
        lessonNumber: 2,
        imageId: 'new-image',
        words,
      }),
    );
    expect(ctx.images.deleteIfReplaced).toHaveBeenCalledWith(
      'old-image',
      'new-image',
    );
    expect(result).toEqual({ id: 'lesson-id' });
  });

  it('clears lesson number and image when null is sent', async () => {
    const ctx = setup();

    await ctx.service.update('lesson-id', {
      lessonNumber: null,
      imageId: null,
    });

    expect(ctx.lessonsRepo.findOne).toHaveBeenCalledTimes(1);
    expect(ctx.lessonsRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ lessonNumber: null, imageId: null }),
    );
    expect(ctx.images.deleteIfReplaced).toHaveBeenCalledWith('old-image', null);
  });

  it('rejects a slug already used in the topic', async () => {
    const ctx = setup();
    ctx.lessonsRepo.findOne.mockResolvedValueOnce({ id: 'other' });

    await expect(
      ctx.service.update('lesson-id', { slug: 'dinner' }),
    ).rejects.toThrow('Lesson slug already exists in this topic');
    expect(ctx.lessonsRepo.save).not.toHaveBeenCalled();
  });

  it('rejects a lesson number already in use', async () => {
    const ctx = setup();
    ctx.lessonsRepo.findOne.mockResolvedValueOnce({ id: 'other' });

    await expect(
      ctx.service.update('lesson-id', { lessonNumber: 5 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
