import { Pencil } from 'lucide-react';

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
import { WordImage } from '@/features/words/WordImage';
import { WordLessons } from '@/features/words/WordLessons';
import type { Word } from '@/features/words/words.types';
import {
  formatTranscription,
  formatWordForms,
  groupByPartOfSpeech,
} from '@/features/words/words.utils';

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
          {group.items.map((translation, index) => (
            <span
              key={translation.id}
              className={translation.isPrimary ? 'font-bold' : ''}
            >
              {translation.text}
              {index < group.items.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

interface TopicWordsTableProps {
  words: Word[];
  onEdit?: (word: Word) => void;
}

export function TopicWordsTable({ words, onEdit }: TopicWordsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[56px] pl-6">#</TableHead>
          <TableHead className="w-[72px]">Image</TableHead>
          <TableHead>Word</TableHead>
          <TableHead>Translations</TableHead>
          <TableHead>Lessons</TableHead>
          <TableHead className="pr-6">Examples</TableHead>
          {onEdit && <TableHead className="pr-6 text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {words.map((word, index) => (
          <TableRow key={word.id}>
            <TableCell className="text-muted-foreground pl-6 align-top tabular-nums">
              {index + 1}
            </TableCell>
            <TableCell className="align-top">
              <WordImage word={word} className="size-10 shrink-0 border" />
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
              <WordLessons
                lessons={word.lessons}
                empty={<span className="text-muted-foreground">—</span>}
              />
            </TableCell>
            <TableCell className="pr-6 align-top">
              <Badge variant="secondary">{word.examples.length}</Badge>
            </TableCell>
            {onEdit && (
              <TableCell className="pr-6 text-right align-top">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={`Edit ${word.word}`}
                  onClick={() => onEdit(word)}
                >
                  <Pencil className="size-4" />
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
