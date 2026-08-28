import { PARTS_OF_SPEECH } from './words.types';
import type { WordTranslation } from './words.types';

export function groupByPartOfSpeech(translations: WordTranslation[]) {
  return PARTS_OF_SPEECH.map((p) => ({
    label: p.label,
    items: translations.filter((t) => t.partOfSpeech === p.value),
  })).filter((group) => group.items.length > 0);
}
