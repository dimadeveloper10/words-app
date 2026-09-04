import { Layers, MessageSquareQuote, Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { WordImage } from '../WordImage';
import { WordTopics } from '../WordTopics';
import { formatTranscription, groupByPartOfSpeech } from '../words.utils';
import type { Word, WordsViewProps } from '../words.types';

function TranslationsInline({ word }: { word: Word }) {
  const groups = groupByPartOfSpeech(word.translations);

  if (groups.length === 0) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  return (
    <p className="line-clamp-2 text-sm">
      {groups.map((group, groupIndex) => (
        <span key={group.label}>
          {groupIndex > 0 && <span className="text-muted-foreground"> · </span>}
          <span className="text-muted-foreground" title={group.fullLabel}>
            {group.label}:{' '}
          </span>
          {group.items.map((t, i) => (
            <span key={t.id} className={t.isPrimary ? 'font-bold' : ''}>
              {t.text}
              {i < group.items.length - 1 ? ', ' : ''}
            </span>
          ))}
        </span>
      ))}
    </p>
  );
}

function CountBadge({
  icon,
  count,
  tooltip,
}: {
  icon: React.ReactNode;
  count: number;
  tooltip: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger className="cursor-help">
        <Badge variant="secondary" className="gap-1 px-1.5 font-normal">
          {icon}
          {count}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function CardMeta({ word }: { word: Word }) {
  if (word.forms.length === 0 && word.examples.length === 0) {
    return null;
  }

  return (
    <div className="mt-auto flex items-center gap-1 pt-2">
      {word.forms.length > 0 && (
        <CountBadge
          icon={<Layers className="size-3" />}
          count={word.forms.length}
          tooltip={word.forms.map((form) => form.form).join(', ')}
        />
      )}
      {word.examples.length > 0 && (
        <CountBadge
          icon={<MessageSquareQuote className="size-3" />}
          count={word.examples.length}
          tooltip={word.examples.map((example) => example.text).join(' · ')}
        />
      )}
    </div>
  );
}

export function WordsCards({
  words,
  rangeFrom,
  onEdit,
  onDelete,
}: WordsViewProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3 px-6">
      {words.map((word, index) => (
        <div
          key={word.id}
          role="button"
          tabIndex={0}
          aria-label={`Edit ${word.word}`}
          className="focus-visible:ring-ring flex cursor-pointer flex-col overflow-hidden rounded-md border transition hover:bg-muted/30 focus-visible:ring-2 focus-visible:outline-none"
          onClick={() => onEdit(word)}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onEdit(word);
            }
          }}
        >
          <WordImage
            word={word}
            className="aspect-[4/3] w-full rounded-none border-b"
            iconClassName="size-8"
          />

          <div className="flex flex-1 flex-col p-3">
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground pt-0.5 text-xs tabular-nums">
                {rangeFrom + index}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{word.word}</div>
                {word.transcription && (
                  <div className="text-muted-foreground truncate text-xs">
                    {formatTranscription(word.transcription)}
                  </div>
                )}
              </div>
              <div
                className="-mr-1 -mt-1 flex shrink-0"
                onClick={(event) => event.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Edit ${word.word}`}
                  onClick={() => onEdit(word)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Delete ${word.word}`}
                  onClick={() => onDelete(word)}
                >
                  <Trash2 className="text-destructive size-4" />
                </Button>
              </div>
            </div>

            <WordTopics topics={word.topics} className="pt-2" />

            <div className="pt-1">
              <TranslationsInline word={word} />
            </div>

            <CardMeta word={word} />
          </div>
        </div>
      ))}
    </div>
  );
}
