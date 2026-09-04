import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTopics } from '@/features/topics/useTopics';
import {
  emptyLessonValues,
  lessonFormSchema,
  lessonToFormValues,
} from './lessons.schemas';
import type { LessonFormValues } from './lessons.schemas';
import type { Lesson } from './lessons.types';
import { useCreateLesson, useUpdateLesson } from './useLessons';

interface LessonDialogProps {
  lesson?: Lesson;
  fixedTopic?: Pick<Lesson['topic'], 'id' | 'name'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LessonDialog({
  lesson,
  fixedTopic,
  open,
  onOpenChange,
}: LessonDialogProps) {
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const topicsQuery = useTopics({ page: 1, limit: 100 });
  const isEdit = lesson !== undefined;
  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: lesson
      ? lessonToFormValues(lesson)
      : {
          ...emptyLessonValues(),
          topicId: fixedTopic?.id ?? '',
        },
  });

  const topicOptions = (topicsQuery.data?.items ?? []).map((topic) => ({
    id: topic.id,
    name: topic.name,
  }));
  const selectedTopic = lesson?.topic ?? fixedTopic;
  if (
    selectedTopic &&
    !topicOptions.some((topic) => topic.id === selectedTopic.id)
  ) {
    topicOptions.push({ id: selectedTopic.id, name: selectedTopic.name });
  }

  const onSubmit = async (values: LessonFormValues) => {
    try {
      const valuesWithFixedTopic = fixedTopic
        ? { ...values, topicId: fixedTopic.id }
        : values;
      if (isEdit) {
        await updateLesson.mutateAsync({
          id: lesson.id,
          values: valuesWithFixedTopic,
        });
      } else {
        await createLesson.mutateAsync(valuesWithFixedTopic);
      }
      onOpenChange(false);
    } catch {
      return;
    }
  };

  const isSubmitting = createLesson.isPending || updateLesson.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-xl"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit lesson' : 'Add lesson'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update “${lesson.name}”. Its topic cannot be changed.`
              : 'Create a lesson inside a topic.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
            className="grid gap-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Top 100 — Lesson 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. top-100-lesson-1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lessonNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="e.g. 1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="topicId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={
                      isEdit ||
                      fixedTopic !== undefined ||
                      topicsQuery.isLoading ||
                      isSubmitting
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            topicsQuery.isLoading
                              ? 'Loading topics…'
                              : 'Select a topic'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {topicOptions.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!fixedTopic && topicsQuery.isError && (
                    <p className="text-destructive text-sm">
                      Failed to load topics.
                    </p>
                  )}
                  {!fixedTopic &&
                    !topicsQuery.isLoading &&
                    !topicsQuery.isError &&
                    topicOptions.length === 0 && (
                      <p className="text-muted-foreground text-sm">
                        Create a topic before adding a lesson.
                      </p>
                    )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  (!isEdit &&
                    fixedTopic === undefined &&
                    (topicsQuery.isLoading ||
                      topicsQuery.isError ||
                      topicOptions.length === 0))
                }
              >
                {isSubmitting && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {isEdit ? 'Save' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
