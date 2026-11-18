import { FolderPlus, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface WordsSelectionBarProps {
  pageWordIds: string[];
  selectedIds: string[];
  onTogglePage: (wordIds: string[], checked: boolean) => void;
  onClear: () => void;
  onAddToTopic: () => void;
  onDelete: () => void;
}

function pageSelectionState(
  pageWordIds: string[],
  selectedIds: string[],
): boolean | 'indeterminate' {
  const selectedOnPage = pageWordIds.filter((id) => selectedIds.includes(id));
  if (selectedOnPage.length === 0) {
    return false;
  }
  return selectedOnPage.length === pageWordIds.length ? true : 'indeterminate';
}

export function WordsSelectionBar({
  pageWordIds,
  selectedIds,
  onTogglePage,
  onClear,
  onAddToTopic,
  onDelete,
}: WordsSelectionBarProps) {
  const hasSelection = selectedIds.length > 0;

  return (
    <div className="bg-muted/40 flex min-h-14 flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-2">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={pageSelectionState(pageWordIds, selectedIds)}
          disabled={pageWordIds.length === 0}
          onCheckedChange={(checked) =>
            onTogglePage(pageWordIds, checked === true)
          }
          aria-label="Select all words on this page"
        />
        <span className="text-sm">
          {hasSelection
            ? `${selectedIds.length} selected`
            : 'Select words on this page'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {hasSelection && (
          <>
            <Button type="button" variant="ghost" size="sm" onClick={onClear}>
              <X className="size-4" />
              Clear selection
            </Button>
            <Button type="button" size="sm" onClick={onAddToTopic}>
              <FolderPlus className="size-4" />
              Add to topic
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDelete}
            >
              <Trash2 className="size-4" />
              Delete selected
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
