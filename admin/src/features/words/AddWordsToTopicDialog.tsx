import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAddWordsToTopic, useTopics } from '@/features/topics/useTopics';

interface AddWordsToTopicDialogProps {
  wordIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
}

export function AddWordsToTopicDialog({
  wordIds,
  open,
  onOpenChange,
  onAdded,
}: AddWordsToTopicDialogProps) {
  const [topicId, setTopicId] = useState('');
  const topicsQuery = useTopics({ page: 1, limit: 100 });
  const addWordsToTopic = useAddWordsToTopic();
  const topics = topicsQuery.data?.items ?? [];

  const save = async () => {
    try {
      await addWordsToTopic.mutateAsync({ topicId, wordIds });
      onAdded();
      onOpenChange(false);
    } catch {
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add words to topic</DialogTitle>
          <DialogDescription>
            Add {wordIds.length} selected {wordIds.length === 1 ? 'word' : 'words'}
            to a topic. Existing topic assignments will be preserved.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Label htmlFor="bulk-topic">Topic</Label>
          <Select
            value={topicId}
            onValueChange={setTopicId}
            disabled={topicsQuery.isLoading || addWordsToTopic.isPending}
          >
            <SelectTrigger id="bulk-topic" className="w-full">
              <SelectValue
                placeholder={
                  topicsQuery.isLoading ? 'Loading topics…' : 'Select a topic'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {topicsQuery.isError && (
            <p className="text-destructive text-sm">Failed to load topics.</p>
          )}
          {!topicsQuery.isLoading &&
            !topicsQuery.isError &&
            topics.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Create a topic before adding words.
              </p>
            )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={addWordsToTopic.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={
              !topicId ||
              topicsQuery.isLoading ||
              topicsQuery.isError ||
              addWordsToTopic.isPending
            }
            onClick={() => void save()}
          >
            {addWordsToTopic.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Add to topic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
