import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { Word } from './entities/word.entity';
import {
  buildExample,
  buildForm,
  buildTranslation,
  normalizeWord,
} from './words.service.helper';
import { WordTranslation } from './entities/word-translation.entity';
import { WordForm } from './entities/word-form.entity';
import { WordExample } from './entities/word-example.entity';

@Injectable()
export class WordsService {
  constructor(
    @InjectRepository(Word)
    private readonly wordsRepository: Repository<Word>,
  ) {}

  findAll(): Promise<Word[]> {
    return this.wordsRepository.find({
      relations: { translations: true, forms: true, examples: true },
      order: { word: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Word> {
    const word = await this.wordsRepository.findOne({
      where: { id },
      relations: { translations: true, forms: true, examples: true },
    });
    if (!word) {
      throw new NotFoundException('Word not found');
    }
    return word;
  }

  async create(dto: CreateWordDto): Promise<Word> {
    const headword = normalizeWord(dto.word);
    await this.ensureUniqueWord(headword);

    const word = this.wordsRepository.create({
      word: headword,
      transcription: dto.transcription ?? null,
      imageUrl: dto.imageUrl ?? null,
      translations: dto.translations.map(buildTranslation),
      forms: (dto.forms ?? []).map(buildForm),
      examples: (dto.examples ?? []).map(buildExample),
    });

    const saved = await this.wordsRepository.save(word);
    return this.findOne(saved.id);
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
    // Child rows are removed via ON DELETE CASCADE on their FKs.
    await this.wordsRepository.remove(word);
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
