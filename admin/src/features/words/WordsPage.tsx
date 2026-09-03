import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import {
  AlertCircle,
  FolderPlus,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { getApiErrorMessage } from '@/lib/api';
import { DataPagination } from '@/components/DataPagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { WordDialog } from './word-dialog/WordDialog';
import { useDeleteWord, useDeleteWords, useWords } from './useWords';
import { ViewToggle } from './ViewToggle';
import { WordsCards } from './cards/WordsCards';
import { WordsTable } from './table/WordsTable';
import type { Word, WordsView } from './words.types';
import { AddWordsToTopicDialog } from './AddWordsToTopicDialog';

const PAGE_SIZE = 20;

export function WordsPage() {
  const [editing, setEditing] = useState<{ word?: Word } | null>(null);
  const [wordToDelete, setWordToDelete] = useState<Word | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [addToTopicOpen, setAddToTopicOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [view, setView] = useState<WordsView>('list');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);
  const { data, isLoading, isFetching, isError, error } = useWords({
    q: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const deleteWord = useDeleteWord();
  const deleteWords = useDeleteWords();

  useEffect(() => {
    if (data && data.totalPages > 0 && page > data.totalPages) {
      setPage(data.totalPages);
    }
  }, [data, page]);

  const confirmDelete = () => {
    if (!wordToDelete) return;
    deleteWord.mutate(wordToDelete.id, {
      onSuccess: () => {
        setSelectedIds((currentIds) =>
          currentIds.filter((id) => id !== wordToDelete.id),
        );
        setWordToDelete(null);
      },
    });
  };

  const toggleWord = (wordId: string, checked: boolean) => {
    setSelectedIds((currentIds) =>
      checked
        ? [...currentIds, wordId]
        : currentIds.filter((id) => id !== wordId),
    );
  };

  const togglePage = (wordIds: string[], checked: boolean) => {
    setSelectedIds((currentIds) => {
      if (!checked) {
        return currentIds.filter((id) => !wordIds.includes(id));
      }

      return [...new Set([...currentIds, ...wordIds])];
    });
  };

  const confirmBulkDelete = () => {
    deleteWords.mutate(selectedIds, {
      onSuccess: () => {
        setSelectedIds([]);
        setBulkDeleteOpen(false);
      },
    });
  };

  const words = data?.items ?? [];
  const pageWordIds = words.map((word) => word.id);
  const allPageSelected =
    words.length > 0 && pageWordIds.every((id) => selectedIds.includes(id));
  const somePageSelected = pageWordIds.some((id) => selectedIds.includes(id));
  const rangeFrom =
    data && data.total > 0 ? (data.page - 1) * data.limit + 1 : 0;
  const rangeTo = data ? rangeFrom + words.length - 1 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Words</h1>
          <p className="text-muted-foreground text-sm">
            Manage dictionary entries.
          </p>
        </div>
        <Button onClick={() => setEditing({})}>
          <Plus className="size-4" />
          Add word
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
          <Input
            placeholder="Search words or translations…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-8"
          />
        </div>
        <ViewToggle value={view} onChange={setView} />
      </div>

      {view === 'list' && (
        <div className="bg-muted/40 flex min-h-14 flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={
                allPageSelected
                  ? true
                  : somePageSelected
                    ? 'indeterminate'
                    : false
              }
              disabled={words.length === 0}
              onCheckedChange={(checked) =>
                togglePage(pageWordIds, checked === true)
              }
              aria-label="Select all words on this page"
            />
            <span className="text-sm">
              {selectedIds.length > 0
                ? `${selectedIds.length} selected`
                : 'Select words on this page'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                >
                  <X className="size-4" />
                  Clear selection
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setAddToTopicOpen(true)}
                >
                  <FolderPlus className="size-4" />
                  Add to topic
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  <Trash2 className="size-4" />
                  Delete selected
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <Card>
        <CardContent className="px-0">
          {isLoading && (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Loading words…
            </div>
          )}

          {isError && (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center text-sm">
              <AlertCircle className="text-destructive size-5" />
              {isAxiosError(error) && error.response?.status === 403
                ? "You don't have permission to view words."
                : getApiErrorMessage(error, 'Failed to load words.')}
            </div>
          )}

          {!isLoading && !isError && data && (
            <div
              className={
                isFetching
                  ? 'opacity-60 transition-opacity'
                  : 'transition-opacity'
              }
            >
              {words.length === 0 ? (
                <p className="text-muted-foreground py-12 text-center text-sm">
                  {debouncedSearch
                    ? `No words match “${debouncedSearch}”.`
                    : 'No words yet — add your first word.'}
                </p>
              ) : view === 'list' ? (
                <WordsTable
                  words={words}
                  rangeFrom={rangeFrom}
                  onEdit={(word) => setEditing({ word })}
                  onDelete={setWordToDelete}
                  selectedIds={selectedIds}
                  onToggleWord={toggleWord}
                />
              ) : (
                <WordsCards
                  words={words}
                  rangeFrom={rangeFrom}
                  onEdit={(word) => setEditing({ word })}
                  onDelete={setWordToDelete}
                />
              )}
            </div>
          )}

          {!isLoading && !isError && data && data.total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t px-6 pt-4">
              <p className="text-muted-foreground text-sm">
                Showing {rangeFrom}–{rangeTo} of {data.total}
              </p>
              <DataPagination
                page={data.page}
                totalPages={data.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {editing && (
        <WordDialog
          key={editing.word?.id ?? 'create'}
          word={editing.word}
          open
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
        />
      )}

      {addToTopicOpen && (
        <AddWordsToTopicDialog
          wordIds={selectedIds}
          open
          onOpenChange={setAddToTopicOpen}
          onAdded={() => setSelectedIds([])}
        />
      )}

      <AlertDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected words?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedIds.length}{' '}
              {selectedIds.length === 1 ? 'word' : 'words'} and their
              translations, forms, examples and topic/lesson links. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteWords.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                confirmBulkDelete();
              }}
              disabled={deleteWords.isPending}
            >
              {deleteWords.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={wordToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setWordToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete word?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete “{wordToDelete?.word}” and all its
              translations, forms and examples. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteWord.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleteWord.isPending}
            >
              {deleteWord.isPending && <Loader2 className="animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
