import { useState } from 'react';
import { Loader2, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import type { Word } from '@/features/words/words.types';
import { useTopicWords } from '@/features/topics/useTopics';
import type { Lesson } from './lessons.types';
import { useUpdateLessonWords } from './useLessons';

interface ManageLessonWordsDialogProps {
  lesson: Lesson;
  currentWords: Word[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageLessonWordsDialog({
  lesson,
  currentWords,
  open,
  onOpenChange,
}: ManageLessonWordsDialogProps) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(() =>
    currentWords.map((word) => word.id),
  );
  const topicWords = useTopicWords(lesson.topic.id);
  const updateLessonWords = useUpdateLessonWords();
  const normalizedSearch = search.trim().toLowerCase();
  const filteredWords = (topicWords.data ?? []).filter(
    (word) =>
      word.word.toLowerCase().includes(normalizedSearch) ||
      word.translations.some((translation) =>
        translation.text.toLowerCase().includes(normalizedSearch),
      ),
  );

  const toggleWord = (wordId: string, checked: boolean) => {
    setSelectedIds((currentIds) =>
      checked
        ? [...currentIds, wordId]
        : currentIds.filter((selectedId) => selectedId !== wordId),
    );
  };

  const save = async () => {
    try {
      await updateLessonWords.mutateAsync({
        id: lesson.id,
        wordIds: selectedIds,
      });
      onOpenChange(false);
    } catch {
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Manage lesson words</DialogTitle>
          <DialogDescription>
            Select words from “{lesson.topic.name}” for “{lesson.name}”.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search words or translations…"
              className="pl-9"
            />
          </div>
          <Badge variant="secondary" className="shrink-0">
            {selectedIds.length} selected
          </Badge>
        </div>

        <div className="max-h-80 overflow-y-auto rounded-md border p-1">
          {topicWords.isLoading && (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-10 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Loading topic words…
            </div>
          )}

          {topicWords.isError && (
            <p className="text-destructive py-10 text-center text-sm">
              Failed to load topic words.
            </p>
          )}

          {topicWords.data && topicWords.data.length === 0 && (
            <p className="text-muted-foreground py-10 text-center text-sm">
              This topic has no words yet.
            </p>
          )}

          {topicWords.data &&
            topicWords.data.length > 0 &&
            filteredWords.length === 0 && (
              <p className="text-muted-foreground py-10 text-center text-sm">
                No words match “{search.trim()}”.
              </p>
            )}

          {filteredWords.map((word) => {
            const checked = selectedIds.includes(word.id);
            const translations = word.translations
              .map((translation) => translation.text)
              .join(', ');

            return (
              <label
                key={word.id}
                className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-sm px-3 py-2"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(nextChecked) =>
                    toggleWord(word.id, nextChecked === true)
                  }
                  aria-label={`Select ${word.word}`}
                  className="mt-0.5"
                />
                <span className="min-w-0">
                  <span className="font-medium">{word.word}</span>
                  {word.transcription && (
                    <span className="text-muted-foreground ml-2 text-sm">
                      {word.transcription}
                    </span>
                  )}
                  {translations && (
                    <span className="text-muted-foreground block truncate text-sm">
                      {translations}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            disabled={selectedIds.length === 0 || updateLessonWords.isPending}
            onClick={() => setSelectedIds([])}
          >
            Clear all
          </Button>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={updateLessonWords.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                topicWords.isLoading ||
                topicWords.isError ||
                updateLessonWords.isPending
              }
              onClick={() => void save()}
            >
              {updateLessonWords.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
