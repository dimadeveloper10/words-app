import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { AlertCircle, Loader2, Plus, Search } from 'lucide-react';
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
import { getApiErrorMessage } from '@/lib/api';
import { DataPagination } from '@/components/DataPagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { AddWordDialog } from './add-word/AddWordDialog';
import { useDeleteWord, useWords } from './useWords';
import { ViewToggle } from './ViewToggle';
import { WordsCards } from './cards/WordsCards';
import { WordsTable } from './table/WordsTable';
import type { Word, WordsView } from './words.types';

const PAGE_SIZE = 20;

export function WordsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [wordToDelete, setWordToDelete] = useState<Word | null>(null);
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

  useEffect(() => {
    if (data && data.totalPages > 0 && page > data.totalPages) {
      setPage(data.totalPages);
    }
  }, [data, page]);

  const confirmDelete = () => {
    if (!wordToDelete) return;
    deleteWord.mutate(wordToDelete.id, {
      onSuccess: () => setWordToDelete(null),
    });
  };

  const words = data?.items ?? [];
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
        <Button onClick={() => setDialogOpen(true)}>
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
                  onDelete={setWordToDelete}
                />
              ) : (
                <WordsCards
                  words={words}
                  rangeFrom={rangeFrom}
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

      <AddWordDialog open={dialogOpen} onOpenChange={setDialogOpen} />

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
