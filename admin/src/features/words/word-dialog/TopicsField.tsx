import { useFormContext } from 'react-hook-form';

import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useTopics } from '@/features/topics/useTopics';
import type { WordFormValues } from '../words.schemas';
import { TopicMultiSelect } from './TopicMultiSelect';

const TOPICS_LIMIT = 100;

export function TopicsField() {
  const form = useFormContext<WordFormValues>();
  const { data, isLoading, isError } = useTopics({
    page: 1,
    limit: TOPICS_LIMIT,
  });
  const topics = data?.items ?? [];

  return (
    <FormField
      control={form.control}
      name="topicIds"
      render={({ field }) => (
        <FormItem>
          <div>
            <FormLabel>Topics (optional)</FormLabel>
            <FormDescription>
              Select every topic this word belongs to.
            </FormDescription>
          </div>

          <TopicMultiSelect
            topics={topics}
            value={field.value}
            onChange={field.onChange}
            disabled={isLoading || isError || topics.length === 0}
            placeholder={
              isLoading
                ? 'Loading topics…'
                : isError
                  ? 'Failed to load topics'
                  : topics.length === 0
                    ? 'No topics available'
                    : 'Select topics'
            }
          />

          {data && data.total > TOPICS_LIMIT && (
            <FormDescription>
              Showing the first {TOPICS_LIMIT} topics.
            </FormDescription>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
