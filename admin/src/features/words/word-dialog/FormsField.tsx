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
import type { WordFormValues } from '../words.schemas';

export function FormsField() {
  const { control } = useFormContext<WordFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'forms',
  });

  return (
    <div className="space-y-3">
      <FormLabel>Forms (optional)</FormLabel>

      {fields.map((item, index) => (
        <div key={item.id} className="flex items-start gap-2">
          <FormField
            control={control}
            name={`forms.${index}.form`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="e.g. did" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            onClick={() => remove(index)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ form: '' })}
      >
        <Plus className="size-4" />
        Add form
      </Button>
    </div>
  );
}
