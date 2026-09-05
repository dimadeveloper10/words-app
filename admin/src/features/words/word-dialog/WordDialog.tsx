import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
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
import { useDictionaryTranscription } from '@/features/dictionary/useDictionaryTranscription';
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
  const transcriptionManuallyEdited = useRef(false);
  const watchedWord = useWatch({ control: form.control, name: 'word' });
  const [transcriptionLookupWord, setTranscriptionLookupWord] = useState('');
  const transcriptionQuery = useDictionaryTranscription(
    transcriptionLookupWord,
    !isEdit && !transcriptionManuallyEdited.current,
  );

  useEffect(() => {
    const normalizedCurrentWord = watchedWord.trim().toLowerCase();
    const normalizedLookupWord = transcriptionLookupWord.trim().toLowerCase();
    const transcription = transcriptionQuery.data?.transcription;

    if (
      isEdit ||
      transcriptionManuallyEdited.current ||
      normalizedCurrentWord !== normalizedLookupWord ||
      !transcription
    ) {
      return;
    }

    form.setValue('transcription', transcription, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [
    form,
    isEdit,
    transcriptionLookupWord,
    transcriptionQuery.data,
    watchedWord,
  ]);

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
        className="h-[85dvh] max-h-[85dvh] grid-rows-[auto_minmax(0,1fr)] overflow-hidden sm:max-w-6xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit word' : 'Add word'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
            className="flex min-h-0 flex-col"
          >
            <div className="grid min-h-0 gap-6 overflow-y-auto pr-2">
              <div className="grid items-start gap-6 lg:grid-cols-3">
                <TopicsField fixedTopic={fixedTopic} />

                <div className="grid items-start gap-6 lg:col-span-3 lg:grid-cols-3">
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
                            <Input
                              placeholder="e.g. run"
                              {...field}
                              onChange={(event) => {
                                field.onChange(event);
                                if (
                                  !isEdit &&
                                  !transcriptionManuallyEdited.current
                                ) {
                                  setTranscriptionLookupWord('');
                                  form.setValue('transcription', '', {
                                    shouldDirty: false,
                                    shouldTouch: false,
                                    shouldValidate: false,
                                  });
                                }
                              }}
                              onBlur={(event) => {
                                field.onBlur();

                                if (
                                  !isEdit &&
                                  !transcriptionManuallyEdited.current
                                ) {
                                  setTranscriptionLookupWord(
                                    event.currentTarget.value.trim(),
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="transcription"
                      render={({ field }) => (
                        <FormItem className="relative">
                          <FormLabel>Transcription</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                className="pr-10"
                                placeholder="e.g. /rʌn/"
                                {...field}
                                onChange={(event) => {
                                  transcriptionManuallyEdited.current = true;
                                  field.onChange(event);
                                }}
                              />
                            </FormControl>
                            {transcriptionQuery.isFetching && (
                              <Loader2
                                className="text-muted-foreground pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin"
                                aria-label="Loading transcription"
                              />
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="lg:self-stretch lg:border-l lg:pl-6">
                    <FormsField />
                  </div>

                  <div className="grid content-start gap-2 lg:border-l lg:pl-6">
                    <ImageField
                      value={imageFile}
                      onChange={setImageFile}
                      currentUrl={word?.imageUrl}
                      currentExternalUrl={word?.externalUrl}
                      alternativeInput={
                        <>
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
                        </>
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="border-t" />

              <div className="lg:w-2/3">
                <TranslationsField />
              </div>

              <div className="border-t" />

              <div className="w-full pb-1 md:max-w-[50%]">
                <ExamplesField />
              </div>
            </div>

            <DialogFooter className="mt-4 shrink-0 border-t bg-background pt-4">
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
