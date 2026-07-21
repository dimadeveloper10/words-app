import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { WordForm } from './entities/word-form.entity';
import { WordTranslation } from './entities/word-translation.entity';
import { Word } from './entities/word.entity';

@Injectable()
export class WordsService {
  constructor(
    @InjectRepository(Word)
    private readonly wordsRepository: Repository<Word>,
  ) {}

  findAll(): Promise<Word[]> {
    return this.wordsRepository.find({
      relations: { translations: true, forms: true },
      order: { word: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Word> {
    const word = await this.wordsRepository.findOne({
      where: { id },
      relations: { translations: true, forms: true },
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
    });

    const saved = await this.wordsRepository.save(word);
    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateWordDto): Promise<Word> {
    const word = await this.findOne(id);

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
    // Reassigning a collection replaces it wholesale (orphaned rows are deleted).
    if (dto.translations !== undefined) {
      word.translations = dto.translations.map(buildTranslation);
    }
    if (dto.forms !== undefined) {
      word.forms = dto.forms.map(buildForm);
    }

    await this.wordsRepository.save(word);
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

function normalizeWord(word: string): string {
  return word.toLowerCase().trim();
}

function buildTranslation(
  dto: CreateWordDto['translations'][number],
): WordTranslation {
  const translation = new WordTranslation();
  translation.partOfSpeech = dto.partOfSpeech;
  translation.text = dto.text.trim();
  translation.isPrimary = dto.isPrimary ?? false;
  translation.sortOrder = dto.sortOrder ?? 0;
  return translation;
}

function buildForm(dto: NonNullable<CreateWordDto['forms']>[number]): WordForm {
  const form = new WordForm();
  form.form = dto.form.trim();
  form.sortOrder = dto.sortOrder ?? 0;
  return form;
}
