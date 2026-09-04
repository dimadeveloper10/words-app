import { z } from 'zod';

import type {
  CreateLessonPayload,
  Lesson,
  UpdateLessonPayload,
} from './lessons.types';

export const lessonFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  slug: z.string().trim().min(1, 'Slug is required'),
  lessonNumber: z
    .string()
    .refine(
      (value) => value === '' || /^-?\d+$/.test(value),
      'Lesson number must be an integer',
    ),
  topicId: z.string().uuid('Topic is required'),
});

export type LessonFormValues = z.infer<typeof lessonFormSchema>;

export const emptyLessonValues = (): LessonFormValues => ({
  name: '',
  slug: '',
  lessonNumber: '',
  topicId: '',
});

export const lessonToFormValues = (lesson: Lesson): LessonFormValues => ({
  name: lesson.name,
  slug: lesson.slug,
  lessonNumber:
    lesson.lessonNumber === null ? '' : String(lesson.lessonNumber),
  topicId: lesson.topic.id,
});

export const toCreateLessonPayload = (
  values: LessonFormValues,
): CreateLessonPayload => ({
  name: values.name,
  slug: values.slug,
  lessonNumber:
    values.lessonNumber === '' ? null : Number(values.lessonNumber),
  topicId: values.topicId,
});

export const toUpdateLessonPayload = (
  values: LessonFormValues,
): UpdateLessonPayload => ({
  name: values.name,
  slug: values.slug,
  lessonNumber:
    values.lessonNumber === '' ? null : Number(values.lessonNumber),
});
