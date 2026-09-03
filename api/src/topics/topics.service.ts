import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Paginated, paginated } from '../common/dto/paginated';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Topic } from './entities/topic.entity';
import { Word } from '../words/entities/word.entity';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicsRepository: Repository<Topic>,
    @InjectRepository(Word)
    private readonly wordsRepository: Repository<Word>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<Paginated<Topic>> {
    const { page, limit } = query;
    const [items, total] = await this.topicsRepository
      .createQueryBuilder('topic')
      .orderBy('topic.sortOrder', 'ASC')
      .addOrderBy('topic.name', 'ASC')
      .addOrderBy('topic.id', 'ASC')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    return paginated(items, total, page, limit);
  }

  async findOne(id: string): Promise<Topic> {
    const topic = await this.topicsRepository
      .createQueryBuilder('topic')
      .where('topic.id = :id', { id })
      .getOne();
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }
    return topic;
  }

  async findWords(id: string): Promise<Word[]> {
    await this.findOne(id);

    return this.wordsRepository.find({
      where: { topics: { id } },
      relations: {
        translations: true,
        forms: true,
        examples: true,
        topics: true,
      },
      order: {
        word: 'ASC',
        id: 'ASC',
        translations: { isPrimary: 'DESC', sortOrder: 'ASC' },
        forms: { sortOrder: 'ASC' },
        examples: { sortOrder: 'ASC' },
        topics: { sortOrder: 'ASC', name: 'ASC', id: 'ASC' },
      },
    });
  }

  async create(dto: CreateTopicDto): Promise<Topic> {
    const name = this.normalizeName(dto.name);
    const slug = this.normalizeSlug(dto.slug);
    await this.ensureUnique(name, slug);

    const topic = this.topicsRepository.create({
      name,
      slug,
      description: dto.description ?? null,
      sortOrder: dto.sortOrder ?? 0,
    });

    const savedTopic = await this.topicsRepository.save(topic);
    return this.findOne(savedTopic.id);
  }

  async update(id: string, dto: UpdateTopicDto): Promise<Topic> {
    const topic = await this.findOne(id);
    const name =
      dto.name === undefined ? undefined : this.normalizeName(dto.name);
    const slug =
      dto.slug === undefined ? undefined : this.normalizeSlug(dto.slug);

    await this.ensureUnique(name, slug, id);

    if (name !== undefined) {
      topic.name = name;
    }
    if (slug !== undefined) {
      topic.slug = slug;
    }
    if (dto.description !== undefined) {
      topic.description = dto.description ?? null;
    }
    if (dto.sortOrder !== undefined) {
      topic.sortOrder = dto.sortOrder;
    }

    const savedTopic = await this.topicsRepository.save(topic);
    return this.findOne(savedTopic.id);
  }

  async remove(id: string): Promise<void> {
    const topic = await this.findOne(id);
    await this.topicsRepository.remove(topic);
  }

  private normalizeName(value: string): string {
    const name = value.trim();
    if (!name) {
      throw new BadRequestException('Topic name must not be empty');
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
    name: string | undefined,
    slug: string | undefined,
    exceptId?: string,
  ): Promise<void> {
    if (name !== undefined) {
      const existingName = await this.topicsRepository.findOne({
        where: exceptId ? { name, id: Not(exceptId) } : { name },
      });
      if (existingName) {
        throw new ConflictException('Topic name already exists');
      }
    }

    if (slug !== undefined) {
      const existingSlug = await this.topicsRepository.findOne({
        where: exceptId ? { slug, id: Not(exceptId) } : { slug },
      });
      if (existingSlug) {
        throw new ConflictException('Topic slug already exists');
      }
    }
  }
}
