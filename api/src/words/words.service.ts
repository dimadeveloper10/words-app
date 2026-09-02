import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Not, Repository } from 'typeorm';
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
import { deleteWordImage, saveWordImage } from './word-image.storage';
import { Paginated, paginated } from '../common/dto/paginated';

@Injectable()
export class WordsService {
  constructor(
    @InjectRepository(Word)
    private readonly wordsRepository: Repository<Word>,
  ) {}

  async findAll(query: QueryWordsDto): Promise<Paginated<Word>> {
    const { page, limit } = query;
    const term = query.q?.trim();

    const pageQuery = this.wordsRepository
      .createQueryBuilder('w')
      .select('w.id')
      .orderBy('w.createdAt', 'DESC')
      .addOrderBy('w.id', 'ASC')
      .take(limit)
      .skip((page - 1) * limit);

    if (term) {
      pageQuery.where(
        'w.word ILIKE :q OR EXISTS (SELECT 1 FROM word_translations wt WHERE wt.word_id = w.id AND wt.text ILIKE :q)',
        { q: `%${escapeLike(term)}%` },
      );
    }

    const [pageRows, total] = await pageQuery.getManyAndCount();
    if (pageRows.length === 0) {
      return paginated([], total, page, limit);
    }

    const items = await this.wordsRepository.find({
      where: { id: In(pageRows.map((row) => row.id)) },
      relations: {
        translations: true,
        forms: true,
        examples: true,
        topics: true,
      },
      order: {
        createdAt: 'DESC',
        id: 'ASC',
        translations: { isPrimary: 'DESC', sortOrder: 'ASC' },
        forms: { sortOrder: 'ASC' },
        examples: { sortOrder: 'ASC' },
        topics: { sortOrder: 'ASC', name: 'ASC', id: 'ASC' },
      },
    });

    return paginated(items, total, page, limit);
  }

  async findOne(id: string): Promise<Word> {
    const word = await this.wordsRepository.findOne({
      where: { id },
      relations: {
        translations: true,
        forms: true,
        examples: true,
        topics: true,
      },
      order: {
        translations: { isPrimary: 'DESC', sortOrder: 'ASC' },
        forms: { sortOrder: 'ASC' },
        examples: { sortOrder: 'ASC' },
        topics: { sortOrder: 'ASC', name: 'ASC', id: 'ASC' },
      },
    });
    if (!word) {
      throw new NotFoundException('Word not found');
    }
    return word;
  }

  async create(dto: CreateWordDto): Promise<Word> {
    const headword = normalizeWord(dto.word);
    await this.ensureUniqueWord(headword);

    const wordId = await this.wordsRepository.manager.transaction(
      async (manager) => {
        const topics = await this.resolveTopics(manager, dto.topicIds ?? []);
        const wordsRepository = manager.getRepository(Word);
        const word = wordsRepository.create({
          word: headword,
          transcription: dto.transcription ?? null,
          imageUrl: dto.imageUrl ?? null,
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

    await this.wordsRepository.manager.transaction(async (manager) => {
      if (dto.word !== undefined) {
        const headword = normalizeWord(dto.word);
        await this.ensureUniqueWord(headword, id);
        word.word = headword;
      }
      if (dto.transcription !== undefined) {
        word.transcription = dto.transcription ?? null;
      }
      if (dto.imageUrl !== undefined) {
        word.imageUrl = dto.imageUrl ?? null;
      }
      if (dto.topicIds !== undefined) {
        word.topics = await this.resolveTopics(manager, dto.topicIds);
      }

      if (dto.translations !== undefined) {
        await manager.delete(WordTranslation, { word: { id } });
        word.translations = dto.translations.map(buildTranslation);
      }
      if (dto.forms !== undefined) {
        await manager.delete(WordForm, { word: { id } });
        word.forms = dto.forms.map(buildForm);
      }
      if (dto.examples !== undefined) {
        await manager.delete(WordExample, { word: { id } });
        word.examples = dto.examples.map(buildExample);
      }

      await manager.save(word);
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const word = await this.findOne(id);
    await this.wordsRepository.remove(word);
    if (word.imageUrl) {
      await deleteWordImage(word.imageUrl);
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

  async setImage(id: string, file: Express.Multer.File): Promise<Word> {
    const word = await this.findOne(id);
    const previousUrl = word.imageUrl;

    const imageUrl = await saveWordImage(file);
    await this.wordsRepository.update(id, { imageUrl });

    if (previousUrl) {
      await deleteWordImage(previousUrl);
    }
    return this.findOne(id);
  }
}
