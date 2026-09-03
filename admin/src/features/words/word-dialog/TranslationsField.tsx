import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
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
import { PARTS_OF_SPEECH } from '../words.types';
import { makeTranslation, type WordFormValues } from '../words.schemas';

export function TranslationsField() {
  const { control } = useFormContext<WordFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'translations',
  });

  return (
    <div className="space-y-3">
      <FormLabel>
        Translations <span className="text-destructive">*</span>
      </FormLabel>

      {fields.map((item, index) => (
        <div key={item.id} className="space-y-3 rounded-md border p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground text-xs font-medium">
              Translation {index + 1}
            </span>

            <div className="flex items-center gap-3">
              <FormField
                control={control}
                name={`translations.${index}.isPrimary`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-xs font-normal">
                      Primary
                    </FormLabel>
                  </FormItem>
                )}
              />

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
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={control}
              name={`translations.${index}.partOfSpeech`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Part of speech <span className="text-destructive">*</span>
                  </FormLabel>
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
              control={control}
              name={`translations.${index}.text`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Translation <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Переклад українською" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
  );
}
