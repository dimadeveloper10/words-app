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

const VISIBLE_PARTS_OF_SPEECH = PARTS_OF_SPEECH.slice(0, 4);
const OTHER_PARTS_OF_SPEECH = PARTS_OF_SPEECH.slice(4);

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
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    {VISIBLE_PARTS_OF_SPEECH.map((part) => {
                      const id = `translation-${item.id}-${part.value}`;

                      return (
                        <div
                          key={part.value}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={id}
                            checked={field.value === part.value}
                            onCheckedChange={(checked) => {
                              if (checked) field.onChange(part.value);
                            }}
                          />
                          <label htmlFor={id} className="text-sm">
                            {part.label}
                          </label>
                        </div>
                      );
                    })}

                    <Select
                      value={
                        OTHER_PARTS_OF_SPEECH.some(
                          (part) => part.value === field.value,
                        )
                          ? field.value
                          : ''
                      }
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger size="sm">
                        <SelectValue placeholder="Other" />
                      </SelectTrigger>
                      <SelectContent>
                        {OTHER_PARTS_OF_SPEECH.map((part) => (
                          <SelectItem key={part.value} value={part.value}>
                            {part.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
