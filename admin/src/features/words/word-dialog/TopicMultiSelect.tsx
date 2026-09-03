import { ChevronsUpDown, Search } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Topic } from '@/features/topics/topics.types';

interface TopicMultiSelectProps {
  topics: Array<Pick<Topic, 'id' | 'name'>>;
  value: string[];
  onChange: (topicIds: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function TopicMultiSelect({
  topics,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select topics',
}: TopicMultiSelectProps) {
  const [search, setSearch] = useState('');
  const normalizedSearch = search.trim().toLowerCase();
  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(normalizedSearch),
  );
  const selectedTopics = topics.filter((topic) => value.includes(topic.id));
  const unavailableCount = value.length - selectedTopics.length;

  const toggleTopic = (topicId: string, checked: boolean) => {
    onChange(
      checked
        ? [...value, topicId]
        : value.filter((selectedId) => selectedId !== topicId),
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          className="h-auto min-h-9 w-full justify-between px-3 py-2 font-normal"
        >
          <span className="flex min-w-0 flex-1 flex-wrap gap-1">
            {selectedTopics.length === 0 && unavailableCount === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {selectedTopics.map((topic) => (
                  <Badge key={topic.id} variant="secondary">
                    {topic.name}
                  </Badge>
                ))}
                {unavailableCount > 0 && (
                  <Badge variant="secondary">+{unavailableCount} selected</Badge>
                )}
              </>
            )}
          </span>
          <ChevronsUpDown className="text-muted-foreground size-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <div className="relative border-b p-2">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search topics…"
            className="pl-8"
          />
        </div>

        <div className="max-h-60 overflow-y-auto p-1">
          {filteredTopics.length === 0 ? (
            <p className="text-muted-foreground px-2 py-6 text-center text-sm">
              No topics found.
            </p>
          ) : (
            filteredTopics.map((topic) => {
              const checked = value.includes(topic.id);

              return (
                <label
                  key={topic.id}
                  className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(nextChecked) =>
                      toggleTopic(topic.id, nextChecked === true)
                    }
                    aria-label={`Select ${topic.name}`}
                  />
                  <span>{topic.name}</span>
                </label>
              );
            })
          )}
        </div>

        {value.length > 0 && (
          <div className="border-t p-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => onChange([])}
            >
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
