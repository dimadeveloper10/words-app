export interface WordTranslation {
  id: string;
  partOfSpeech: string;
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
}
