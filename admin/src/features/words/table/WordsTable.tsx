import { Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WordImage } from '../WordImage';
import { WordLessons } from '../WordLessons';
import { WordTopics } from '../WordTopics';
import {
  formatTranscription,
  formatWordForms,
  groupByPartOfSpeech,
} from '../words.utils';
import type { Word, WordsViewProps } from '../words.types';

interface WordsTableProps extends WordsViewProps {
  selectedIds: string[];
  onToggleWord: (wordId: string, checked: boolean) => void;
}

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
          <span className="text-muted-foreground" title={group.fullLabel}>
            {group.label}:{' '}
          </span>
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

export function WordsTable({
  words,
  rangeFrom,
  onEdit,
  onDelete,
  selectedIds,
  onToggleWord,
}: WordsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[52px]" />
          <TableHead className="w-[56px] pl-0">#</TableHead>
          <TableHead className="w-[72px]">Image</TableHead>
          <TableHead>Word</TableHead>
          <TableHead>Translations</TableHead>
          <TableHead>Topics</TableHead>
          <TableHead>Lessons</TableHead>
          <TableHead>Examples</TableHead>
          <TableHead className="pr-6 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {words.map((word, index) => (
          <TableRow
            key={word.id}
            role="button"
            tabIndex={0}
            aria-label={`Edit ${word.word}`}
            className="focus-visible:ring-ring cursor-pointer focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none"
            onClick={() => onEdit(word)}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onEdit(word);
              }
            }}
          >
            <TableCell
              className="pl-6 align-top"
              onClick={(event) => event.stopPropagation()}
            >
              <Checkbox
                checked={selectedIds.includes(word.id)}
                onCheckedChange={(checked) =>
                  onToggleWord(word.id, checked === true)
                }
                aria-label={`Select ${word.word}`}
              />
            </TableCell>
            <TableCell className="text-muted-foreground align-top tabular-nums">
              {rangeFrom + index}
            </TableCell>
            <TableCell className="align-top">
              <ImageCell word={word} />
            </TableCell>
            <TableCell className="align-top">
              <div className="font-medium">
                {word.word}
                {word.forms.length > 0 && (
                  <span className="text-muted-foreground font-normal">
                    {' '}
                    ({formatWordForms(word.forms)})
                  </span>
                )}
              </div>
              {word.transcription && (
                <div className="text-muted-foreground text-sm">
                  {formatTranscription(word.transcription)}
                </div>
              )}
            </TableCell>
            <TableCell className="align-top">
              <TranslationsCell word={word} />
            </TableCell>
            <TableCell className="max-w-xs align-top">
              <WordTopics
                topics={word.topics}
                empty={<span className="text-muted-foreground">—</span>}
              />
            </TableCell>
            <TableCell className="max-w-xs align-top">
              <WordLessons
                lessons={word.lessons}
                empty={<span className="text-muted-foreground">—</span>}
              />
            </TableCell>
            <TableCell className="align-top">
              <Badge variant="secondary">{word.examples.length}</Badge>
            </TableCell>
            <TableCell
              className="pr-6 text-right align-top"
              onClick={(event) => event.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Edit ${word.word}`}
                onClick={() => onEdit(word)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Delete ${word.word}`}
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
