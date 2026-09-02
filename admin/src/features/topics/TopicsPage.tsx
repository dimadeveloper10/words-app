import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { AlertCircle, Loader2, Trash2 } from 'lucide-react';

import { DataPagination } from '@/components/DataPagination';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useDeleteTopic, useTopics } from './useTopics';
import type { Topic } from './topics.types';

const PAGE_SIZE = 20;

export function TopicsPage() {
  const [page, setPage] = useState(1);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);
  const role = useAuthStore((state) => state.user?.role);
  const canDelete = role === 'admin' || role === 'superadmin';
  const { data, isLoading, isFetching, isError, error } = useTopics({
    page,
    limit: PAGE_SIZE,
  });
  const deleteTopic = useDeleteTopic();

  useEffect(() => {
    if (data && data.totalPages > 0 && page > data.totalPages) {
      setPage(data.totalPages);
    }
  }, [data, page]);

  const confirmDelete = () => {
    if (!topicToDelete) return;
    deleteTopic.mutate(topicToDelete.id, {
      onSuccess: () => setTopicToDelete(null),
    });
  };

  const topics = data?.items ?? [];
  const rangeFrom =
    data && data.total > 0 ? (data.page - 1) * data.limit + 1 : 0;
  const rangeTo = data ? rangeFrom + topics.length - 1 : 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Topics</h1>
        <p className="text-muted-foreground text-sm">
          Browse dictionary topics.
        </p>
      </div>

      <Card>
        <CardContent className="px-0">
          {isLoading && (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Loading topics…
            </div>
          )}

          {isError && (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center text-sm">
              <AlertCircle className="text-destructive size-5" />
              {isAxiosError(error) && error.response?.status === 403
                ? "You don't have permission to view topics."
                : getApiErrorMessage(error, 'Failed to load topics.')}
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
              {topics.length === 0 ? (
                <p className="text-muted-foreground py-12 text-center text-sm">
                  No topics yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[56px] pl-6">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Sort order</TableHead>
                      {canDelete && (
                        <TableHead className="pr-6 text-right">
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topics.map((topic, index) => (
                      <TableRow key={topic.id}>
                        <TableCell className="text-muted-foreground pl-6 tabular-nums">
                          {rangeFrom + index}
                        </TableCell>
                        <TableCell className="font-medium">
                          {topic.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">
                          {topic.slug}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-md whitespace-normal">
                          {topic.description ?? '—'}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {topic.sortOrder}
                        </TableCell>
                        {canDelete && (
                          <TableCell className="pr-6 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              aria-label={`Delete ${topic.name}`}
                              onClick={() => setTopicToDelete(topic)}
                            >
                              <Trash2 className="text-destructive size-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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

      <AlertDialog
        open={topicToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setTopicToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete topic?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete “{topicToDelete?.name}”. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTopic.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
              disabled={deleteTopic.isPending}
            >
              {deleteTopic.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
