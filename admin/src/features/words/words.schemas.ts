import { z } from 'zod';

import { PARTS_OF_SPEECH, type PartOfSpeech } from './words.types';

const partOfSpeechValues = PARTS_OF_SPEECH.map((p) => p.value) as [
  PartOfSpeech,
  ...PartOfSpeech[],
];

const translationSchema = z.object({
  partOfSpeech: z.enum(partOfSpeechValues, {
    required_error: 'Part of speech is required',
  }),
  text: z.string().min(1, 'Translation is required'),
  isPrimary: z.boolean(),
});

const wordFormSchema = z.object({
  form: z.string().min(1, 'Form is required'),
});

const exampleSchema = z.object({
  text: z.string().min(1, 'Example is required'),
  translation: z.string().optional(),
});

export const createWordSchema = z.object({
  word: z.string().min(1, 'Word is required'),
  transcription: z.string().optional(),
  translations: z
    .array(translationSchema)
    .min(1, 'At least one translation is required'),
  forms: z.array(wordFormSchema),
  examples: z.array(exampleSchema),
});

export type CreateWordValues = z.infer<typeof createWordSchema>;
export type TranslationValues = z.infer<typeof translationSchema>;
export type WordFormValues = z.infer<typeof wordFormSchema>;
export type ExampleValues = z.infer<typeof exampleSchema>;

export const makeTranslation = (isPrimary: boolean): TranslationValues => ({
  partOfSpeech: undefined as unknown as PartOfSpeech,
  text: '',
  isPrimary,
});
