import { Badge } from '@/components/ui/badge';
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
import { WordImage } from '@/features/words/WordImage';
import type { Word } from '@/features/words/words.types';
import { groupByPartOfSpeech } from '@/features/words/words.utils';

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

export function LessonWordsTable({ words }: { words: Word[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[56px] pl-6">#</TableHead>
          <TableHead className="w-[72px]">Image</TableHead>
          <TableHead>Word</TableHead>
          <TableHead>Translations</TableHead>
          <TableHead>Forms</TableHead>
          <TableHead className="pr-6">Examples</TableHead>
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
            <TableCell className="pr-6 align-top">
              <Badge variant="secondary">{word.examples.length}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
