import { PARTS_OF_SPEECH } from './words.types';
import type { WordForm, WordTranslation } from './words.types';

export function formatWordForms(forms: WordForm[]): string {
  return forms.map((form) => form.form).join(', ');
}

export function formatTranscription(transcription: string): string {
  const value = transcription.trim();
  const hasSlashes = value.startsWith('/') && value.endsWith('/');
  const hasBrackets = value.startsWith('[') && value.endsWith(']');
  const unwrapped = hasSlashes || hasBrackets ? value.slice(1, -1) : value;

  return `[${unwrapped}]`;
}

export function groupByPartOfSpeech(translations: WordTranslation[]) {
  return PARTS_OF_SPEECH.map((p) => ({
    label: p.shortLabel,
    fullLabel: p.label,
    items: translations.filter((t) => t.partOfSpeech === p.value),
  })).filter((group) => group.items.length > 0);
}
