import type { Word } from './words.types';

export function formatTranslation(word: Word) {
  const primary = word.translations.filter((t) => t.isPrimary);
  const shown = primary.length > 0 ? primary : word.translations.slice(0, 1);
  return shown.map((t) => t.text).join(', ');
}
