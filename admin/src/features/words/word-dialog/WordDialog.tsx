import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
  emptyWordValues,
  wordFormSchema,
  wordToFormValues,
  type WordFormValues,
} from '../words.schemas';
import { useCreateWord, useUpdateWord, useUploadWordImage } from '../useWords';
import type { Word } from '../words.types';
import type { Topic } from '@/features/topics/topics.types';
import { ImageField } from './ImageField';
import { TopicsField } from './TopicsField';
import { TranslationsField } from './TranslationsField';
import { FormsField } from './FormsField';
import { ExamplesField } from './ExamplesField';

interface WordDialogProps {
  word?: Word;
  fixedTopic?: Pick<Topic, 'id' | 'name'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WordDialog({
  word,
  fixedTopic,
  open,
  onOpenChange,
}: WordDialogProps) {
  const createWord = useCreateWord();
  const updateWord = useUpdateWord();
  const uploadImage = useUploadWordImage();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<WordFormValues>({
    resolver: zodResolver(wordFormSchema),
    defaultValues: word
      ? wordToFormValues(word)
      : {
          ...emptyWordValues(),
          topicIds: fixedTopic ? [fixedTopic.id] : [],
        },
  });

  const isEdit = word !== undefined;

  const onSubmit = async (values: WordFormValues) => {
    try {
      const valuesWithFixedTopic = fixedTopic
        ? { ...values, topicIds: [fixedTopic.id] }
        : values;
      const saved = isEdit
        ? await updateWord.mutateAsync({
            id: word.id,
            values: valuesWithFixedTopic,
          })
        : await createWord.mutateAsync(valuesWithFixedTopic);

      if (imageFile) {
        try {
          await uploadImage.mutateAsync({ id: saved.id, file: imageFile });
        } catch {
          toast.warning(
            `Word "${saved.word}" saved, but the image failed to upload.`,
          );
        }
      }

      onOpenChange(false);
    } catch {
      return;
    }
  };

  const isSubmitting =
    createWord.isPending || updateWord.isPending || uploadImage.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[85vh] overflow-y-auto sm:max-w-4xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit word' : 'Add word'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
            className="grid gap-6"
          >
            <div className="grid items-start gap-6 md:grid-cols-2">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="word"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Word <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. run" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transcription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transcription</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. /rʌn/" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <TopicsField fixedTopic={fixedTopic} />
              </div>

              <div className="grid content-start gap-2">
                <ImageField
                  value={imageFile}
                  onChange={setImageFile}
                  currentUrl={word?.imageUrl}
                  currentExternalUrl={word?.externalUrl}
                />

                <div className="text-muted-foreground text-center text-sm">
                  or
                </div>

                <FormField
                  control={form.control}
                  name="externalUrl"
                  render={({ field }) => (
                    <FormItem className="gap-1">
                      <FormLabel>External image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t" />

            <TranslationsField />

            <div className="border-t" />

            <div className="grid items-start gap-6">
              <div className="w-full md:max-w-[50%]">
                <FormsField />
              </div>

              <div className="border-t" />

              <div className="w-full md:max-w-[50%]">
                <ExamplesField />
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" />}
                {isEdit ? 'Save' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
