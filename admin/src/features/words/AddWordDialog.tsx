import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

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
import { createWordSchema, type CreateWordValues } from './words.schemas';
import { PARTS_OF_SPEECH } from './words.types';
import { useCreateWord } from './useWords';

interface AddWordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddWordDialog({ open, onOpenChange }: AddWordDialogProps) {
  const createWord = useCreateWord();

  const form = useForm<CreateWordValues>({
    resolver: zodResolver(createWordSchema),
    defaultValues: {
      word: '',
      transcription: '',
      imageUrl: '',
      partOfSpeech: undefined,
      translationText: '',
    },
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add word</DialogTitle>
          <DialogDescription>
            Create a new dictionary entry with one translation.
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

            <FormField
              control={form.control}
              name="partOfSpeech"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Part of speech</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
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
              name="translationText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Translation</FormLabel>
                  <FormControl>
                    <Input placeholder="Переклад українською" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
