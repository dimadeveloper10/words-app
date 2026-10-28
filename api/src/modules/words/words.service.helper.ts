import { CreateWordDto } from './dto/create-word.dto';
import { WordTranslation } from './entities/word-translation.entity';
import { WordForm } from './entities/word-form.entity';
import { WordExample } from './entities/word-example.entity';

export const normalizeWord = (word: string): string => {
  return word.toLowerCase().trim();
};

export const buildTranslation = (
  dto: CreateWordDto['translations'][number],
): WordTranslation => {
  const translation = new WordTranslation();
  translation.partOfSpeech = dto.partOfSpeech;
  translation.text = dto.text.trim();
  translation.isPrimary = dto.isPrimary ?? false;
  translation.sortOrder = dto.sortOrder ?? 0;
  return translation;
};

export const buildForm = (
  dto: NonNullable<CreateWordDto['forms']>[number],
): WordForm => {
  const form = new WordForm();
  form.form = dto.form.trim();
  form.sortOrder = dto.sortOrder ?? 0;
  return form;
};

export const buildExample = (
  dto: NonNullable<CreateWordDto['examples']>[number],
): WordExample => {
  const example = new WordExample();
  example.text = dto.text.trim();
  example.translation = dto.translation?.trim() ?? null;
  example.sortOrder = dto.sortOrder ?? 0;
  return example;
};

export const escapeLike = (input: string): string =>
  input.replace(/[\\%_]/g, (ch) => `\\${ch}`);
