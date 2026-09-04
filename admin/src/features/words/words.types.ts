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
  { value: 'noun', label: 'Noun', shortLabel: 'noun' },
  { value: 'verb', label: 'Verb', shortLabel: 'verb' },
  { value: 'adjective', label: 'Adjective', shortLabel: 'adj' },
  { value: 'adverb', label: 'Adverb', shortLabel: 'adv' },
  { value: 'pronoun', label: 'Pronoun', shortLabel: 'pron' },
  { value: 'preposition', label: 'Preposition', shortLabel: 'prep' },
  { value: 'conjunction', label: 'Conjunction', shortLabel: 'conj' },
  { value: 'interjection', label: 'Interjection', shortLabel: 'int' },
  { value: 'numeral', label: 'Numeral', shortLabel: 'num' },
  { value: 'determiner', label: 'Determiner', shortLabel: 'det' },
  { value: 'article', label: 'Article', shortLabel: 'art' },
  { value: 'particle', label: 'Particle', shortLabel: 'part' },
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

export interface WordLesson {
  id: string;
  lessonNumber: number | null;
  name: string;
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
  lessons?: WordLesson[];
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
