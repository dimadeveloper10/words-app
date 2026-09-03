import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { AlertCircle, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';

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
import { LessonDialog } from './LessonDialog';
import type { Lesson } from './lessons.types';
import { useDeleteLesson, useLessons } from './useLessons';

const PAGE_SIZE = 20;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function LessonsPage() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<{ lesson?: Lesson } | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const role = useAuthStore((state) => state.user?.role);
  const canManage = role === 'admin' || role === 'superadmin';
  const { data, isLoading, isFetching, isError, error } = useLessons({
    page,
    limit: PAGE_SIZE,
  });
  const deleteLesson = useDeleteLesson();

  useEffect(() => {
    if (data && data.totalPages > 0 && page > data.totalPages) {
      setPage(data.totalPages);
    }
  }, [data, page]);

  const confirmDelete = () => {
    if (!lessonToDelete) return;
    deleteLesson.mutate(lessonToDelete.id, {
      onSuccess: () => setLessonToDelete(null),
    });
  };

  const lessons = data?.items ?? [];
  const rangeFrom =
    data && data.total > 0 ? (data.page - 1) * data.limit + 1 : 0;
  const rangeTo = data ? rangeFrom + lessons.length - 1 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lessons</h1>
          <p className="text-muted-foreground text-sm">
            {canManage ? 'Manage lessons.' : 'Browse lessons.'}
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setEditing({})}>
            <Plus className="size-4" />
            Add lesson
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="px-0">
          {isLoading && (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Loading lessons…
            </div>
          )}

          {isError && (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center text-sm">
              <AlertCircle className="text-destructive size-5" />
              {isAxiosError(error) && error.response?.status === 403
                ? "You don't have permission to view lessons."
                : getApiErrorMessage(error, 'Failed to load lessons.')}
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
              {lessons.length === 0 ? (
                <p className="text-muted-foreground py-12 text-center text-sm">
                  No lessons yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[56px] pl-6">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead className="text-right">Words</TableHead>
                      <TableHead>Added by</TableHead>
                      <TableHead>Created</TableHead>
                      {canManage && (
                        <TableHead className="pr-6 text-right">
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lessons.map((lesson, index) => (
                      <TableRow key={lesson.id}>
                        <TableCell className="text-muted-foreground pl-6 tabular-nums">
                          {rangeFrom + index}
                        </TableCell>
                        <TableCell className="font-medium">
                          {lesson.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">
                          {lesson.slug}
                        </TableCell>
                        <TableCell>{lesson.topic.name}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {lesson.wordCount}
                        </TableCell>
                        <TableCell>
                          {lesson.addedBy ? (
                            <div>
                              <div>{lesson.addedBy.name ?? '—'}</div>
                              <div className="text-muted-foreground text-sm">
                                {lesson.addedBy.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(lesson.createdAt)}
                        </TableCell>
                        {canManage && (
                          <TableCell className="pr-6 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              aria-label={`Edit ${lesson.name}`}
                              onClick={() => setEditing({ lesson })}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              aria-label={`Delete ${lesson.name}`}
                              onClick={() => setLessonToDelete(lesson)}
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

      {editing && (
        <LessonDialog
          key={editing.lesson?.id ?? 'create'}
          lesson={editing.lesson}
          open
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
        />
      )}

      <AlertDialog
        open={lessonToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setLessonToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lesson?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete “{lessonToDelete?.name}”. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLesson.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
              disabled={deleteLesson.isPending}
            >
              {deleteLesson.isPending && (
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
