import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindOptionsOrder,
  FindOptionsRelations,
  In,
  Not,
  Repository,
} from 'typeorm';
import { Topic } from '../topics/entities/topic.entity';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { QueryWordsDto } from './dto/query-words.dto';
import { Word } from './entities/word.entity';
import {
  buildExample,
  buildForm,
  buildTranslation,
  escapeLike,
  normalizeWord,
} from './words.service.helper';
import { WordTranslation } from './entities/word-translation.entity';
import { WordForm } from './entities/word-form.entity';
import { WordExample } from './entities/word-example.entity';
import { DeleteWordsDto } from './dto/delete-words.dto';
import { ImagesService } from '../images/images.service';
import { Paginated, paginated } from '../../common/dto/paginated';
import { LessonsService } from '../lessons/lessons.service';

const WORD_RELATIONS = {
  translations: true,
  forms: true,
  examples: true,
  topics: true,
  lessons: true,
} satisfies FindOptionsRelations<Word>;

const WORD_CHILD_ORDER = {
  translations: { isPrimary: 'DESC', sortOrder: 'ASC' },
  forms: { sortOrder: 'ASC' },
  examples: { sortOrder: 'ASC' },
  topics: { sortOrder: 'ASC', name: 'ASC', id: 'ASC' },
  lessons: { lessonNumber: 'ASC', name: 'ASC', id: 'ASC' },
} satisfies FindOptionsOrder<Word>;

@Injectable()
export class WordsService {
  constructor(
    @InjectRepository(Word)
    private readonly wordsRepository: Repository<Word>,
    private readonly lessonsService: LessonsService,
    private readonly imagesService: ImagesService,
  ) {}

  async findAll(query: QueryWordsDto): Promise<Paginated<Word>> {
    const { page, limit } = query;
    const [ids, total] = await this.findPageIds(query);
    if (ids.length === 0) {
      return paginated([], total, page, limit);
    }

    const items = await this.wordsRepository.find({
      where: { id: In(ids) },
      relations: WORD_RELATIONS,
      order: { createdAt: 'ASC', id: 'ASC', ...WORD_CHILD_ORDER },
    });

    return paginated(items, total, page, limit);
  }

  async findOne(id: string): Promise<Word> {
    const word = await this.wordsRepository.findOne({
      where: { id },
      relations: WORD_RELATIONS,
      order: WORD_CHILD_ORDER,
    });
    if (!word) {
      throw new NotFoundException('Word not found');
    }
    return word;
  }

  async create(dto: CreateWordDto): Promise<Word> {
    const headword = normalizeWord(dto.word);
    await this.ensureUniqueWord(headword);
    if (dto.imageId) {
      await this.imagesService.ensureExists(dto.imageId);
    }

    const wordId = await this.wordsRepository.manager.transaction(
      async (manager) => {
        const topics = await this.resolveTopics(manager, dto.topicIds ?? []);
        const wordsRepository = manager.getRepository(Word);
        const word = wordsRepository.create({
          word: headword,
          transcription: dto.transcription ?? null,
          imageId: dto.imageId ?? null,
          translations: dto.translations.map(buildTranslation),
          forms: (dto.forms ?? []).map(buildForm),
          examples: (dto.examples ?? []).map(buildExample),
          topics,
        });

        const savedWord = await wordsRepository.save(word);
        return savedWord.id;
      },
    );

    return this.findOne(wordId);
  }

  private async findPageIds({
    page,
    limit,
    q,
  }: QueryWordsDto): Promise<[string[], number]> {
    const term = q?.trim();
    const pageQuery = this.wordsRepository
      .createQueryBuilder('w')
      .select('w.id')
      .orderBy('w.createdAt', 'ASC')
      .addOrderBy('w.id', 'ASC')
      .take(limit)
      .skip((page - 1) * limit);

    if (term) {
      pageQuery.where(
        'w.word ILIKE :q OR EXISTS (SELECT 1 FROM word_translations wt WHERE wt.word_id = w.id AND wt.text ILIKE :q)',
        { q: `%${escapeLike(term)}%` },
      );
    }

    const [rows, total] = await pageQuery.getManyAndCount();
    return [rows.map((row) => row.id), total];
  }

  private async resolveTopics(
    manager: EntityManager,
    topicIds: string[],
  ): Promise<Topic[]> {
    if (topicIds.length === 0) {
      return [];
    }

    const topics = await manager.getRepository(Topic).find({
      where: { id: In(topicIds) },
    });

    if (topics.length !== topicIds.length) {
      throw new NotFoundException('One or more topics not found');
    }

    return topics;
  }

  async update(id: string, dto: UpdateWordDto): Promise<Word> {
    const word = await this.findOne(id); // 404, якщо немає
    const previousImageId = word.imageId;
    if (dto.imageId) {
      await this.imagesService.ensureExists(dto.imageId);
    }

    await this.wordsRepository.manager.transaction(async (manager) => {
      await this.applyFieldChanges(word, dto);
      if (dto.topicIds !== undefined) {
        await this.replaceTopics(manager, word, dto.topicIds);
      }
      await this.replaceChildren(manager, word, dto);
      await manager.save(word);
    });

    await this.imagesService.deleteIfReplaced(previousImageId, word.imageId);

    return this.findOne(id);
  }

  private async applyFieldChanges(
    word: Word,
    dto: UpdateWordDto,
  ): Promise<void> {
    if (dto.word !== undefined) {
      const headword = normalizeWord(dto.word);
      await this.ensureUniqueWord(headword, word.id);
      word.word = headword;
    }
    if (dto.transcription !== undefined) {
      word.transcription = dto.transcription ?? null;
    }
    if (dto.imageId !== undefined) {
      word.imageId = dto.imageId ?? null;
    }
  }

  private async replaceTopics(
    manager: EntityManager,
    word: Word,
    topicIds: string[],
  ): Promise<void> {
    const topics = await this.resolveTopics(manager, topicIds);
    const nextTopicIds = new Set(topics.map((topic) => topic.id));
    const removedTopicIds = word.topics
      .map((topic) => topic.id)
      .filter((topicId) => !nextTopicIds.has(topicId));

    await this.lessonsService.removeWordFromTopicLessons(
      manager,
      word.id,
      removedTopicIds,
    );
    word.topics = topics;
  }

  private async replaceChildren(
    manager: EntityManager,
    word: Word,
    dto: UpdateWordDto,
  ): Promise<void> {
    const byWord = { word: { id: word.id } };
    if (dto.translations !== undefined) {
      await manager.delete(WordTranslation, byWord);
      word.translations = dto.translations.map(buildTranslation);
    }
    if (dto.forms !== undefined) {
      await manager.delete(WordForm, byWord);
      word.forms = dto.forms.map(buildForm);
    }
    if (dto.examples !== undefined) {
      await manager.delete(WordExample, byWord);
      word.examples = dto.examples.map(buildExample);
    }
  }

  async remove(id: string): Promise<void> {
    const word = await this.findOne(id);
    await this.wordsRepository.remove(word);
    if (word.imageId) {
      await this.imagesService.delete(word.imageId);
    }
  }

  async removeMany(dto: DeleteWordsDto): Promise<void> {
    const imageIds = await this.wordsRepository.manager.transaction(
      async (manager) => {
        const wordsRepository = manager.getRepository(Word);
        const words = await wordsRepository.find({
          where: { id: In(dto.wordIds) },
          select: { id: true, imageId: true },
        });

        if (words.length !== dto.wordIds.length) {
          throw new NotFoundException('One or more words not found');
        }

        const ids = words
          .map((word) => word.imageId)
          .filter((imageId): imageId is string => imageId !== null);
        await manager.remove(words);
        return ids;
      },
    );

    for (const imageId of imageIds) {
      await this.imagesService.delete(imageId);
    }
  }

  private async ensureUniqueWord(
    headword: string,
    exceptId?: string,
  ): Promise<void> {
    const existing = await this.wordsRepository.findOne({
      where: exceptId
        ? { word: headword, id: Not(exceptId) }
        : { word: headword },
    });
    if (existing) {
      throw new ConflictException('Word already exists');
    }
  }
}
