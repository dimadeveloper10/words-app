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
import type { Topic } from '@/features/topics/topics.types';

const TOPICS_LIMIT = 100;

interface TopicsFieldProps {
  fixedTopic?: Pick<Topic, 'id' | 'name'>;
}

export function TopicsField({ fixedTopic }: TopicsFieldProps) {
  const form = useFormContext<WordFormValues>();
  const { data, isLoading, isError } = useTopics({
    page: 1,
    limit: TOPICS_LIMIT,
  });
  const topics = data?.items ?? [];

  if (fixedTopic) {
    return (
      <FormField
        control={form.control}
        name="topicIds"
        render={() => (
          <FormItem>
            <FormLabel>Topic</FormLabel>
            <div className="bg-muted/40 rounded-md border px-3 py-2 text-sm">
              <div className="font-medium">{fixedTopic.name}</div>
              <div className="text-muted-foreground">
                This word will be added to this topic.
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

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
