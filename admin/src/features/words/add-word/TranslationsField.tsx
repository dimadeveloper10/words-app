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
import { makeTranslation, type CreateWordValues } from '../words.schemas';

export function TranslationsField() {
  const { control } = useFormContext<CreateWordValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'translations',
  });

  return (
    <div className="space-y-3">
      <FormLabel>Translations</FormLabel>

      {fields.map((item, index) => (
        <div key={item.id} className="space-y-3 rounded-md border p-3">
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
            control={control}
            name={`translations.${index}.partOfSpeech`}
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
            control={control}
            name={`translations.${index}.text`}
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
  );
}
