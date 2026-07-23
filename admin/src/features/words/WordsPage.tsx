import { useState } from 'react';
import { isAxiosError } from 'axios';
import { AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getApiErrorMessage } from '@/lib/api';
import { AddWordDialog } from './AddWordDialog';
import { useDeleteWord, useWords } from './useWords';
import { PARTS_OF_SPEECH } from './words.types';
import type { Word, WordTranslation } from './words.types';

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
            <span key={t.id} className={t.isPrimary ? 'font-medium' : ''}>
              {t.text}
              {i < group.items.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function WordsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [wordToDelete, setWordToDelete] = useState<Word | null>(null);
  const { data: words, isLoading, isError, error } = useWords();
  const deleteWord = useDeleteWord();

  const confirmDelete = () => {
    if (!wordToDelete) return;
    deleteWord.mutate(wordToDelete.id, {
      onSuccess: () => setWordToDelete(null),
    });
  };

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

          {!isLoading && !isError && words && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Word</TableHead>
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
                      colSpan={5}
                      className="text-muted-foreground py-12 text-center"
                    >
                      No words yet — add your first word.
                    </TableCell>
                  </TableRow>
                )}
                {words.map((word) => (
                  <TableRow key={word.id}>
                    <TableCell className="pl-6 align-top">
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
                      <Badge variant="secondary">{word.forms.length}</Badge>
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
