import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Not, Repository } from 'typeorm';
import { Paginated, paginated } from '../common/dto/paginated';
import { Topic } from '../topics/entities/topic.entity';
import { User } from '../users/entities/user.entity';
import { Word } from '../words/entities/word.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { QueryLessonsDto } from './dto/query-lessons.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './entities/lesson.entity';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,
    @InjectRepository(Topic)
    private readonly topicsRepository: Repository<Topic>,
  ) {}

  async findAll(query: QueryLessonsDto): Promise<Paginated<Lesson>> {
    const { topicId, page, limit } = query;
    await this.findTopic(topicId);

    const [items, total] = await this.lessonQuery()
      .where('topic.id = :topicId', { topicId })
      .orderBy('lesson.createdAt', 'ASC')
      .addOrderBy('lesson.id', 'ASC')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    return paginated(items, total, page, limit);
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonQuery()
      .where('lesson.id = :id', { id })
      .getOne();

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async create(dto: CreateLessonDto, addedBy: User): Promise<Lesson> {
    const lessonId = await this.lessonsRepository.manager.transaction(
      async (manager) => {
        const topic = await this.findTopic(dto.topicId, manager);
        const name = this.normalizeName(dto.name);
        const slug = this.normalizeSlug(dto.slug);
        await this.ensureUnique(manager, topic.id, name, slug);

        const words = await this.resolveWords(
          manager,
          topic.id,
          dto.wordIds ?? [],
        );
        const lessonsRepository = manager.getRepository(Lesson);
        const lesson = lessonsRepository.create({
          name,
          slug,
          topic,
          addedBy,
          words,
        });

        const savedLesson = await lessonsRepository.save(lesson);
        return savedLesson.id;
      },
    );

    return this.findOne(lessonId);
  }

  async update(id: string, dto: UpdateLessonDto): Promise<Lesson> {
    await this.lessonsRepository.manager.transaction(async (manager) => {
      const lessonsRepository = manager.getRepository(Lesson);
      const lesson = await lessonsRepository.findOne({
        where: { id },
        relations: { topic: true },
      });
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }

      const name =
        dto.name === undefined ? undefined : this.normalizeName(dto.name);
      const slug =
        dto.slug === undefined ? undefined : this.normalizeSlug(dto.slug);

      await this.ensureUnique(manager, lesson.topic.id, name, slug, id);

      if (name !== undefined) {
        lesson.name = name;
      }
      if (slug !== undefined) {
        lesson.slug = slug;
      }
      if (dto.wordIds !== undefined) {
        lesson.words = await this.resolveWords(
          manager,
          lesson.topic.id,
          dto.wordIds,
        );
      }

      await lessonsRepository.save(lesson);
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const lesson = await this.findOne(id);
    await this.lessonsRepository.remove(lesson);
  }

  async removeWordFromTopicLessons(
    manager: EntityManager,
    wordId: string,
    topicIds: string[],
  ): Promise<void> {
    if (topicIds.length === 0) {
      return;
    }

    await manager
      .createQueryBuilder()
      .delete()
      .from('lesson_words')
      .where('"word_id" = :wordId', { wordId })
      .andWhere(
        '"lesson_id" IN (SELECT "id" FROM "lessons" WHERE "topic_id" IN (:...topicIds))',
        { topicIds },
      )
      .execute();
  }

  private lessonQuery() {
    return this.lessonsRepository
      .createQueryBuilder('lesson')
      .innerJoinAndSelect('lesson.topic', 'topic')
      .leftJoinAndSelect('lesson.addedBy', 'addedBy')
      .select([
        'lesson',
        'topic.id',
        'topic.name',
        'topic.slug',
        'addedBy.id',
        'addedBy.name',
        'addedBy.email',
      ]);
  }

  private async findTopic(id: string, manager?: EntityManager): Promise<Topic> {
    const repository = manager
      ? manager.getRepository(Topic)
      : this.topicsRepository;
    const topic = await repository.findOneBy({ id });
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }
    return topic;
  }

  private async resolveWords(
    manager: EntityManager,
    topicId: string,
    wordIds: string[],
  ): Promise<Word[]> {
    if (wordIds.length === 0) {
      return [];
    }

    const words = await manager.getRepository(Word).find({
      where: { id: In(wordIds) },
      relations: { topics: true },
    });

    if (words.length !== wordIds.length) {
      throw new NotFoundException('One or more words not found');
    }

    const hasWordOutsideTopic = words.some(
      (word) => !word.topics.some((topic) => topic.id === topicId),
    );
    if (hasWordOutsideTopic) {
      throw new BadRequestException(
        'All lesson words must belong to the lesson topic',
      );
    }

    return words;
  }

  private normalizeName(value: string): string {
    const name = value.trim();
    if (!name) {
      throw new BadRequestException('Lesson name must not be empty');
    }
    return name;
  }

  private normalizeSlug(value: string): string {
    const slug = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) {
      throw new BadRequestException('Slug must contain letters or numbers');
    }
    return slug;
  }

  private async ensureUnique(
    manager: EntityManager,
    topicId: string,
    name: string | undefined,
    slug: string | undefined,
    exceptId?: string,
  ): Promise<void> {
    if (name !== undefined) {
      const existingName = await manager.getRepository(Lesson).findOne({
        where: {
          topic: { id: topicId },
          name,
          ...(exceptId ? { id: Not(exceptId) } : {}),
        },
      });
      if (existingName) {
        throw new ConflictException('Lesson name already exists in this topic');
      }
    }

    if (slug !== undefined) {
      const existingSlug = await manager.getRepository(Lesson).findOne({
        where: {
          topic: { id: topicId },
          slug,
          ...(exceptId ? { id: Not(exceptId) } : {}),
        },
      });
      if (existingSlug) {
        throw new ConflictException('Lesson slug already exists in this topic');
      }
    }
  }
}
