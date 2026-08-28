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
  createWordSchema,
  makeTranslation,
  type CreateWordValues,
} from '../words.schemas';
import { useCreateWord, useUploadWordImage } from '../useWords';
import { ImageField } from './ImageField';
import { TranslationsField } from './TranslationsField';
import { FormsField } from './FormsField';
import { ExamplesField } from './ExamplesField';

interface AddWordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddWordDialog({ open, onOpenChange }: AddWordDialogProps) {
  const createWord = useCreateWord();
  const uploadImage = useUploadWordImage();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<CreateWordValues>({
    resolver: zodResolver(createWordSchema),
    defaultValues: {
      word: '',
      transcription: '',
      translations: [makeTranslation(true)],
      forms: [],
      examples: [],
    },
  });

  const closeAndReset = () => {
    form.reset();
    setImageFile(null);
    onOpenChange(false);
  };

  const onSubmit = async (values: CreateWordValues) => {
    try {
      const word = await createWord.mutateAsync(values);

      if (imageFile) {
        try {
          await uploadImage.mutateAsync({ id: word.id, file: imageFile });
        } catch {
          toast.warning(
            `Word "${word.word}" created, but the image failed to upload.`,
          );
        }
      }

      closeAndReset();
    } catch {
      return;
    }
  };

  const isSubmitting = createWord.isPending || uploadImage.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[85vh] overflow-y-auto sm:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add word</DialogTitle>
          <DialogDescription>
            Create a new dictionary entry with translations, forms and examples.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
            className="grid gap-4"
          >
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

            <ImageField value={imageFile} onChange={setImageFile} />

            <TranslationsField />
            <FormsField />
            <ExamplesField />

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={closeAndReset}>
                Cancel
              </Button>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
