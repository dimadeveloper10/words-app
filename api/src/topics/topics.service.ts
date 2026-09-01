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

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicsRepository: Repository<Topic>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<Paginated<Topic>> {
    const { page, limit } = query;
    const [items, total] = await this.topicsRepository.findAndCount({
      order: { sortOrder: 'ASC', name: 'ASC', id: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return paginated(items, total, page, limit);
  }

  async findOne(id: string): Promise<Topic> {
    const topic = await this.topicsRepository.findOneBy({ id });
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }
    return topic;
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

    return this.topicsRepository.save(topic);
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

    return this.topicsRepository.save(topic);
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
