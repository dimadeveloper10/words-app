import { z } from 'zod';

import { type PartOfSpeech, PARTS_OF_SPEECH } from './words.types';

const partOfSpeechValues = PARTS_OF_SPEECH.map((p) => p.value) as [
  PartOfSpeech,
  ...PartOfSpeech[],
];

export const createWordSchema = z.object({
  word: z.string().min(1, 'Word is required'),
  transcription: z.string().optional(),
  imageUrl: z.string().optional(),
  partOfSpeech: z.enum(partOfSpeechValues, {
    required_error: 'Part of speech is required',
  }),
  translationText: z.string().min(1, 'Translation is required'),
});

export type CreateWordValues = z.infer<typeof createWordSchema>;
