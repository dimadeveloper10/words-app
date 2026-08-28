import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { CreateWordValues } from '../words.schemas';

export function ExamplesField() {
  const { control } = useFormContext<CreateWordValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'examples',
  });

  return (
    <div className="space-y-3">
      <FormLabel>Examples (optional)</FormLabel>

      {fields.map((item, index) => (
        <div key={item.id} className="space-y-3 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium">
              Example {index + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => remove(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          <FormField
            control={control}
            name={`examples.${index}.text`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sentence</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Give me a hand" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`examples.${index}.translation`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Translation (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Переклад речення" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ text: '', translation: '' })}
      >
        <Plus className="size-4" />
        Add example
      </Button>
    </div>
  );
}
