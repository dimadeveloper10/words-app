import { z } from 'zod';

import { PARTS_OF_SPEECH, type PartOfSpeech } from './words.types';
import type { Word, WordPayload } from './words.types';

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

const formItemSchema = z.object({
  form: z.string().min(1, 'Form is required'),
});

const exampleSchema = z.object({
  text: z.string().min(1, 'Example is required'),
  translation: z.string().optional(),
});

export const wordFormSchema = z.object({
  word: z.string().min(1, 'Word is required'),
  transcription: z.string().optional(),
  translations: z
    .array(translationSchema)
    .min(1, 'At least one translation is required'),
  forms: z.array(formItemSchema),
  examples: z.array(exampleSchema),
  topicIds: z.array(z.string().uuid()),
});

export type WordFormValues = z.infer<typeof wordFormSchema>;
export type TranslationValues = z.infer<typeof translationSchema>;
export type FormItemValues = z.infer<typeof formItemSchema>;
export type ExampleValues = z.infer<typeof exampleSchema>;

export const makeTranslation = (isPrimary: boolean): TranslationValues => ({
  partOfSpeech: undefined as unknown as PartOfSpeech,
  text: '',
  isPrimary,
});

export const emptyWordValues = (): WordFormValues => ({
  word: '',
  transcription: '',
  translations: [makeTranslation(true)],
  forms: [],
  examples: [],
  topicIds: [],
});

export const wordToFormValues = (word: Word): WordFormValues => ({
  word: word.word,
  transcription: word.transcription ?? '',
  translations: word.translations.map((t) => ({
    partOfSpeech: t.partOfSpeech,
    text: t.text,
    isPrimary: t.isPrimary,
  })),
  forms: word.forms.map((f) => ({ form: f.form })),
  examples: word.examples.map((e) => ({
    text: e.text,
    translation: e.translation ?? '',
  })),
  topicIds: word.topics.map((topic) => topic.id),
});

export const toWordPayload = (values: WordFormValues): WordPayload => ({
  word: values.word,
  transcription: values.transcription || null,
  translations: values.translations.map((t, index) => ({
    partOfSpeech: t.partOfSpeech,
    text: t.text,
    isPrimary: t.isPrimary,
    sortOrder: index,
  })),
  forms: values.forms.map((f, index) => ({ form: f.form, sortOrder: index })),
  examples: values.examples.map((e, index) => ({
    text: e.text,
    translation: e.translation || undefined,
    sortOrder: index,
  })),
  topicIds: values.topicIds,
});
