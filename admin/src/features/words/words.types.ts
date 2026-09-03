export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'pronoun'
  | 'preposition'
  | 'conjunction'
  | 'interjection'
  | 'numeral'
  | 'determiner'
  | 'article'
  | 'particle';

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
  { value: 'determiner', label: 'Determiner' },
  { value: 'article', label: 'Article' },
  { value: 'particle', label: 'Particle' },
] as const;

export interface WordTranslation {
  id: string;
  partOfSpeech: PartOfSpeech;
  text: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface WordTopic {
  id: string;
  name: string;
  slug: string;
}

export interface Word {
  id: string;
  word: string;
  transcription: string | null;
  imageUrl: string | null;
  externalUrl: string | null;
  translations: WordTranslation[];
  forms: WordForm[];
  examples: WordExample[];
  topics: WordTopic[];
  createdAt: string;
  updatedAt: string;
}

export interface TranslationPayload {
  partOfSpeech: PartOfSpeech;
  text: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface FormPayload {
  form: string;
  sortOrder?: number;
}

export interface ExamplePayload {
  text: string;
  translation?: string;
  sortOrder?: number;
}

export interface WordPayload {
  word: string;
  transcription?: string | null;
  translations: TranslationPayload[];
  forms?: FormPayload[];
  examples?: ExamplePayload[];
  topicIds: string[];
  externalUrl?: string | null;
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

export type WordsView = 'list' | 'cards';

export interface WordsViewProps {
  words: Word[];
  rangeFrom: number;
  onEdit: (word: Word) => void;
  onDelete: (word: Word) => void;
}
