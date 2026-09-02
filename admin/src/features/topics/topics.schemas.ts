import { z } from 'zod';

import type { Topic, TopicPayload } from './topics.types';

export const topicFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  slug: z.string().trim().min(1, 'Slug is required'),
  description: z.string(),
  sortOrder: z.number().int('Sort order must be an integer'),
});

export type TopicFormValues = z.infer<typeof topicFormSchema>;

export const emptyTopicValues = (): TopicFormValues => ({
  name: '',
  slug: '',
  description: '',
  sortOrder: 0,
});

export const topicToFormValues = (topic: Topic): TopicFormValues => ({
  name: topic.name,
  slug: topic.slug,
  description: topic.description ?? '',
  sortOrder: topic.sortOrder,
});

export const toTopicPayload = (values: TopicFormValues): TopicPayload => ({
  name: values.name,
  slug: values.slug,
  description: values.description.trim() || null,
  sortOrder: values.sortOrder,
});
