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
import { formatTranscription } from '@/features/words/words.utils';
import { useTopicWords } from '@/features/topics/useTopics';
import type { Lesson } from './lessons.types';
import { useLessonWords, useUpdateLessonWords } from './useLessons';

interface ManageLessonWordsDialogProps {
  lesson: Lesson;
  currentWords?: Word[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ManageLessonWordsFormProps extends Omit<
  ManageLessonWordsDialogProps,
  'currentWords'
> {
  currentWords: Word[];
}

function ManageLessonWordsForm({
  lesson,
  currentWords,
  open,
  onOpenChange,
}: ManageLessonWordsFormProps) {
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
  const visibleWordIds = filteredWords.map((word) => word.id);
  const selectedVisibleCount = visibleWordIds.filter((wordId) =>
    selectedIds.includes(wordId),
  ).length;
  const allVisibleSelected =
    visibleWordIds.length > 0 && selectedVisibleCount === visibleWordIds.length;
  const selectAllChecked = allVisibleSelected
    ? true
    : selectedVisibleCount > 0
      ? 'indeterminate'
      : false;

  const toggleWord = (wordId: string, checked: boolean) => {
    setSelectedIds((currentIds) =>
      checked
        ? [...currentIds, wordId]
        : currentIds.filter((selectedId) => selectedId !== wordId),
    );
  };

  const toggleAllVisibleWords = (checked: boolean) => {
    setSelectedIds((currentIds) => {
      if (checked) {
        return [...new Set([...currentIds, ...visibleWordIds])];
      }

      const visibleIds = new Set(visibleWordIds);
      return currentIds.filter((wordId) => !visibleIds.has(wordId));
    });
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

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-48 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search words or translations…"
              className="pl-9"
            />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={selectAllChecked}
                disabled={visibleWordIds.length === 0}
                onCheckedChange={(checked) =>
                  toggleAllVisibleWords(checked === true)
                }
                aria-label="Select all visible words"
              />
              Select all
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={selectedIds.length === 0 || updateLessonWords.isPending}
              onClick={() => setSelectedIds([])}
            >
              Clear all
            </Button>
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
                      {formatTranscription(word.transcription)}
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

        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ManageLessonWordsDialog({
  lesson,
  currentWords: initialWords,
  open,
  onOpenChange,
}: ManageLessonWordsDialogProps) {
  const currentWordsQuery = useLessonWords(lesson.id);
  const currentWords = initialWords ?? currentWordsQuery.data;

  if (currentWords) {
    return (
      <ManageLessonWordsForm
        lesson={lesson}
        currentWords={currentWords}
        open={open}
        onOpenChange={onOpenChange}
      />
    );
  }

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

        {currentWordsQuery.isError ? (
          <p className="text-destructive py-10 text-center text-sm">
            Failed to load lesson words.
          </p>
        ) : (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-10 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Loading lesson words…
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
