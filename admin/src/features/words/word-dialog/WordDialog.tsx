import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  emptyWordValues,
  wordFormSchema,
  wordToFormValues,
  type WordFormValues,
} from '../words.schemas';
import { useCreateWord, useUpdateWord, useUploadWordImage } from '../useWords';
import type { Word } from '../words.types';
import { ImageField } from './ImageField';
import { TranslationsField } from './TranslationsField';
import { FormsField } from './FormsField';
import { ExamplesField } from './ExamplesField';

interface WordDialogProps {
  word?: Word;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WordDialog({ word, open, onOpenChange }: WordDialogProps) {
  const createWord = useCreateWord();
  const updateWord = useUpdateWord();
  const uploadImage = useUploadWordImage();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<WordFormValues>({
    resolver: zodResolver(wordFormSchema),
    defaultValues: word ? wordToFormValues(word) : emptyWordValues(),
  });

  const isEdit = word !== undefined;

  const onSubmit = async (values: WordFormValues) => {
    try {
      const saved = isEdit
        ? await updateWord.mutateAsync({ id: word.id, values })
        : await createWord.mutateAsync(values);

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
          <DialogDescription>
            {isEdit
              ? `Update “${word.word}” — translations, forms and examples are replaced with what you submit.`
              : 'Create a new dictionary entry with translations, forms and examples.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
            className="grid gap-4"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="word"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Word</FormLabel>
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
                    <FormLabel>Transcription (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. /rʌn/" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ImageField
                value={imageFile}
                onChange={setImageFile}
                currentUrl={word?.imageUrl}
              />
            </div>

            <TranslationsField />

            <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
              <FormsField />
              <ExamplesField />
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
