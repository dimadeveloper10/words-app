import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { Loader2, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  createWordSchema,
  type CreateWordValues,
  type TranslationValues,
} from './words.schemas';
import { PARTS_OF_SPEECH, type PartOfSpeech } from './words.types';
import { useCreateWord } from './useWords';

interface AddWordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const makeTranslation = (isPrimary: boolean): TranslationValues => ({
  partOfSpeech: undefined as unknown as PartOfSpeech,
  text: '',
  isPrimary,
});

export function AddWordDialog({ open, onOpenChange }: AddWordDialogProps) {
  const createWord = useCreateWord();

  const form = useForm<CreateWordValues>({
    resolver: zodResolver(createWordSchema),
    defaultValues: {
      word: '',
      transcription: '',
      imageUrl: '',
      translations: [makeTranslation(true)],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'translations',
  });

  const onSubmit = (values: CreateWordValues) => {
    createWord.mutate(values, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[85vh] overflow-y-auto sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add word</DialogTitle>
          <DialogDescription>
            Create a new dictionary entry with one or more translations.
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

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Translations</FormLabel>

              {fields.map((field, index) => (
                <div key={field.id} className="space-y-3 rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-medium">
                      Translation {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name={`translations.${index}.partOfSpeech`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Part of speech</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select part of speech" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PARTS_OF_SPEECH.map((p) => (
                              <SelectItem key={p.value} value={p.value}>
                                {p.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`translations.${index}.text`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Translation</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Переклад українською"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`translations.${index}.isPrimary`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Primary translation
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append(makeTranslation(false))}
              >
                <Plus className="size-4" />
                Add translation
              </Button>
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createWord.isPending}>
                {createWord.isPending && <Loader2 className="animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
