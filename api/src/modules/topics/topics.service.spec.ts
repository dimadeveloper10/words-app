import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ImagesService } from '../images/images.service';
import { Word } from '../words/entities/word.entity';
import { Topic } from './entities/topic.entity';
import { TopicsService } from './topics.service';

describe('TopicsService.update', () => {
  let topic: Topic;
  let save: jest.Mock;
  let findOneBy: jest.Mock;
  let images: { ensureExists: jest.Mock; deleteIfReplaced: jest.Mock };
  let service: TopicsService;

  beforeEach(() => {
    topic = {
      id: 'topic-id',
      name: 'Food',
      slug: 'food',
      description: 'Things to eat',
      sortOrder: 3,
      imageId: 'old-image',
    } as Topic;
    save = jest.fn((value: Topic) => Promise.resolve(value));
    findOneBy = jest.fn().mockResolvedValue(null);
    images = {
      ensureExists: jest.fn().mockResolvedValue(undefined),
      deleteIfReplaced: jest.fn().mockResolvedValue(undefined),
    };
    service = new TopicsService(
      { save, findOne: findOneBy } as unknown as Repository<Topic>,
      {} as Repository<Word>,
      images as unknown as ImagesService,
    );
    jest.spyOn(service, 'findOne').mockResolvedValue(topic);
  });

  it('leaves the topic unchanged when nothing is provided', async () => {
    await service.update('topic-id', {});

    expect(save).toHaveBeenCalledWith({
      id: 'topic-id',
      name: 'Food',
      slug: 'food',
      description: 'Things to eat',
      sortOrder: 3,
      imageId: 'old-image',
    });
    expect(findOneBy).not.toHaveBeenCalled();
    expect(images.ensureExists).not.toHaveBeenCalled();
    expect(images.deleteIfReplaced).toHaveBeenCalledWith(
      'old-image',
      'old-image',
    );
  });

  it('normalizes and applies every provided field', async () => {
    await service.update('topic-id', {
      name: '  Drinks ',
      slug: ' Hot Drinks! ',
      description: 'Things to drink',
      sortOrder: 0,
      imageId: 'new-image',
    });

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Drinks',
        slug: 'hot-drinks',
        description: 'Things to drink',
        sortOrder: 0,
        imageId: 'new-image',
      }),
    );
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(images.ensureExists).toHaveBeenCalledWith('new-image');
    expect(images.deleteIfReplaced).toHaveBeenCalledWith(
      'old-image',
      'new-image',
    );
  });

  it('clears description and image when null is sent', async () => {
    await service.update('topic-id', { description: null, imageId: null });

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ description: null, imageId: null }),
    );
    expect(images.ensureExists).not.toHaveBeenCalled();
    expect(images.deleteIfReplaced).toHaveBeenCalledWith('old-image', null);
  });

  it('rejects a slug without letters or numbers before saving', async () => {
    await expect(
      service.update('topic-id', { slug: '!!!' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(save).not.toHaveBeenCalled();
  });

  it('rejects a name already used by another topic', async () => {
    findOneBy.mockResolvedValueOnce({ id: 'other-topic' });

    await expect(
      service.update('topic-id', { name: 'Drinks' }),
    ).rejects.toThrow('Topic name already exists');
    expect(save).not.toHaveBeenCalled();
  });
});
