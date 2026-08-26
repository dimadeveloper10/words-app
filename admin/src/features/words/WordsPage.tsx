import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import {
  AlertCircle,
  ImageOff,
  Loader2,
  Plus,
  Search,
  Trash2,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getApiErrorMessage } from '@/lib/api';
import { DataPagination } from '@/components/DataPagination';
import { AddWordDialog } from './add-word/AddWordDialog';
import { useDeleteWord, useWords } from './useWords';
import { PARTS_OF_SPEECH } from './words.types';
import type { Word, WordTranslation } from './words.types';
import { useDebouncedValue } from '@/hooks/useDebouncedValue.ts';
import { Input } from '@/components/ui/input.tsx';

function groupByPartOfSpeech(translations: WordTranslation[]) {
  return PARTS_OF_SPEECH.map((p) => ({
    label: p.label,
    items: translations.filter((t) => t.partOfSpeech === p.value),
  })).filter((group) => group.items.length > 0);
}

function TranslationsCell({ word }: { word: Word }) {
  const groups = groupByPartOfSpeech(word.translations);

  if (groups.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="space-y-1">
      {groups.map((group) => (
        <div key={group.label} className="text-sm">
          <span className="text-muted-foreground">{group.label}: </span>
          {group.items.map((t, i) => (
            <span key={t.id} className={t.isPrimary ? 'font-bold' : ''}>
              {t.text}
              {i < group.items.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function FormsCell({ word }: { word: Word }) {
  if (word.forms.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger className="cursor-help">
        <Badge variant="secondary" className="border-b border-dashed">
          {word.forms.length}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-56">
        {word.forms.map((form) => form.form).join(', ')}
      </TooltipContent>
    </Tooltip>
  );
}

function ImageCell({ word }: { word: Word }) {
  if (!word.imageUrl) {
    return (
      <div className="bg-muted flex size-10 items-center justify-center rounded-md">
        <ImageOff className="text-muted-foreground size-4" />
      </div>
    );
  }
  return (
    <img
      src={`${import.meta.env.VITE_API_URL}${word.imageUrl}`}
      alt={word.word}
      className="size-10 rounded-md border object-cover"
    />
  );
}

const PAGE_SIZE = 20;

export function WordsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [wordToDelete, setWordToDelete] = useState<Word | null>(null);

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

      <div className="relative max-w-sm">
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
            <Table
              className={
                isFetching
                  ? 'opacity-60 transition-opacity'
                  : 'transition-opacity'
              }
            >
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[56px] pl-6">#</TableHead>
                  <TableHead className="w-[72px]">Image</TableHead>
                  <TableHead>Word</TableHead>
                  <TableHead>Translations</TableHead>
                  <TableHead>Forms</TableHead>
                  <TableHead>Examples</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {words.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-muted-foreground py-12 text-center"
                    >
                      {debouncedSearch
                        ? `No words match “${debouncedSearch}”.`
                        : 'No words yet — add your first word.'}
                    </TableCell>
                  </TableRow>
                )}
                {words.map((word, index) => (
                  <TableRow key={word.id}>
                    <TableCell className="text-muted-foreground pl-6 align-top tabular-nums">
                      {rangeFrom + index}
                    </TableCell>
                    <TableCell className="align-top">
                      <ImageCell word={word} />
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="font-medium">{word.word}</div>
                      {word.transcription && (
                        <div className="text-muted-foreground text-sm">
                          {word.transcription}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="align-top">
                      <TranslationsCell word={word} />
                    </TableCell>
                    <TableCell className="align-top">
                      <FormsCell word={word} />
                    </TableCell>
                    <TableCell className="align-top">
                      <Badge variant="secondary">{word.examples.length}</Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right align-top">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => setWordToDelete(word)}
                      >
                        <Trash2 className="text-destructive size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
