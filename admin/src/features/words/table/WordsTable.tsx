import { Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { WordImage } from '../WordImage';
import { groupByPartOfSpeech } from '../words.utils';
import type { Word, WordsViewProps } from '../words.types';

function ImageCell({ word }: { word: Word }) {
  return <WordImage word={word} className="size-10 shrink-0 border" />;
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

export function WordsTable({
  words,
  rangeFrom,
  onEdit,
  onDelete,
}: WordsViewProps) {
  return (
    <Table>
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
        {words.map((word, index) => (
          <TableRow key={word.id}>
            <TableCell className="text-muted-foreground pl-6 align-top tabular-nums">
              {rangeFrom + index}
            </TableCell>
            <TableCell className="align-top">
              <button
                type="button"
                aria-label={`Edit ${word.word}`}
                onClick={() => onEdit(word)}
                className="focus-visible:ring-ring cursor-pointer rounded-md transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <ImageCell word={word} />
              </button>
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
                onClick={() => onEdit(word)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => onDelete(word)}
              >
                <Trash2 className="text-destructive size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
