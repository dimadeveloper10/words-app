import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

import { ImageField } from '@/components/ImageField';
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
import { Textarea } from '@/components/ui/textarea';
import { useUploadImage } from '@/features/images/useUploadImage';
import {
  emptyTopicValues,
  topicFormSchema,
  topicToFormValues,
} from './topics.schemas';
import type { TopicFormValues } from './topics.schemas';
import type { Topic } from './topics.types';
import { useCreateTopic, useUpdateTopic } from './useTopics';

interface TopicDialogProps {
  topic?: Topic;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TopicDialog({ topic, open, onOpenChange }: TopicDialogProps) {
  const createTopic = useCreateTopic();
  const updateTopic = useUpdateTopic();
  const uploadImage = useUploadImage();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const isEdit = topic !== undefined;
  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: topic ? topicToFormValues(topic) : emptyTopicValues(),
  });

  const onSubmit = async (values: TopicFormValues) => {
    try {
      const imageId = imageFile
        ? await uploadImage.mutateAsync(imageFile)
        : undefined;

      if (isEdit) {
        await updateTopic.mutateAsync({ id: topic.id, values, imageId });
      } else {
        await createTopic.mutateAsync({ values, imageId });
      }
      onOpenChange(false);
    } catch {
      return;
    }
  };

  const isSubmitting =
    createTopic.isPending || updateTopic.isPending || uploadImage.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-xl"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit topic' : 'Add topic'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update “${topic.name}”.`
              : 'Create a topic for grouping future lessons.'}
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
                      <Input placeholder="e.g. Food" {...field} />
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
                      <Input placeholder="e.g. food" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Words related to food, drinks and cooking"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem className="max-w-40">
                  <FormLabel>Sort order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      {...field}
                      value={Number.isNaN(field.value) ? '' : field.value}
                      onChange={(event) =>
                        field.onChange(event.target.valueAsNumber)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ImageField
              value={imageFile}
              onChange={setImageFile}
              currentImageId={topic?.imageId}
              alt="Topic image"
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? 'Save' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
