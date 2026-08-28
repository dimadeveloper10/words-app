export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'pronoun'
  | 'preposition'
  | 'conjunction'
  | 'interjection'
  | 'numeral';

export const PARTS_OF_SPEECH = [
  { value: 'noun', label: 'Noun' },
  { value: 'verb', label: 'Verb' },
  { value: 'adjective', label: 'Adjective' },
  { value: 'adverb', label: 'Adverb' },
  { value: 'pronoun', label: 'Pronoun' },
  { value: 'preposition', label: 'Preposition' },
  { value: 'conjunction', label: 'Conjunction' },
  { value: 'interjection', label: 'Interjection' },
  { value: 'numeral', label: 'Numeral' },
] as const;

export interface WordTranslation {
  id: string;
  partOfSpeech: PartOfSpeech;
  text: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Word {
  id: string;
  word: string;
  transcription: string | null;
  imageUrl: string | null;
  translations: WordTranslation[];
  forms: WordForm[];
  examples: WordExample[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTranslationPayload {
  partOfSpeech: PartOfSpeech;
  text: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface CreateFormPayload {
  form: string;
  sortOrder?: number;
}

export interface CreateExamplePayload {
  text: string;
  translation?: string;
  sortOrder?: number;
}

export interface CreateWordPayload {
  word: string;
  transcription?: string;
  translations: CreateTranslationPayload[];
  forms?: CreateFormPayload[];
  examples?: CreateExamplePayload[];
}

export interface WordForm {
  id: string;
  form: string;
  sortOrder: number;
}

export interface WordExample {
  id: string;
  text: string;
  translation: string | null;
  sortOrder: number;
}
