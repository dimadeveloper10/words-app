import { useState } from 'react';
import { isAxiosError } from 'axios';
import { AlertCircle, ArrowLeft, ListChecks, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { LessonWordsTable } from './LessonWordsTable';
import { ManageLessonWordsDialog } from './ManageLessonWordsDialog';
import { useLesson, useLessonWords } from './useLessons';

export function LessonDetailsPage() {
  const [manageWordsOpen, setManageWordsOpen] = useState(false);
  const { id = '' } = useParams<{ id: string }>();
  const role = useAuthStore((state) => state.user?.role);
  const canManage = role === 'admin' || role === 'superadmin';
  const lessonQuery = useLesson(id);
  const wordsQuery = useLessonWords(id);

  if (lessonQuery.isError) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/lessons">
            <ArrowLeft className="size-4" />
            Back to lessons
          </Link>
        </Button>
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center text-sm">
          <AlertCircle className="text-destructive size-5" />
          {isAxiosError(lessonQuery.error) &&
          lessonQuery.error.response?.status === 404
            ? 'Lesson not found.'
            : getApiErrorMessage(
                lessonQuery.error,
                'Failed to load lesson.',
              )}
        </div>
      </div>
    );
  }

  if (lessonQuery.isLoading || !lessonQuery.data) {
    return (
      <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Loading lesson…
      </div>
    );
  }

  const lesson = lessonQuery.data;

  return (
    <div className="space-y-4">
      <Button variant="outline" size="sm" asChild>
        <Link to="/lessons">
          <ArrowLeft className="size-4" />
          Back to lessons
        </Link>
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {lesson.name}
            </h1>
            <Badge variant="secondary">{lesson.wordCount} words</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {lesson.topic.name} · {lesson.slug}
          </p>
        </div>
        {canManage && (
          <Button
            disabled={!wordsQuery.data}
            onClick={() => setManageWordsOpen(true)}
          >
            <ListChecks className="size-4" />
            Manage words
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="px-0">
          {wordsQuery.isLoading && (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Loading words…
            </div>
          )}

          {wordsQuery.isError && (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center text-sm">
              <AlertCircle className="text-destructive size-5" />
              {getApiErrorMessage(
                wordsQuery.error,
                'Failed to load lesson words.',
              )}
            </div>
          )}

          {wordsQuery.data &&
            (wordsQuery.data.length === 0 ? (
              <p className="text-muted-foreground py-12 text-center text-sm">
                This lesson has no words yet.
              </p>
            ) : (
              <LessonWordsTable words={wordsQuery.data} />
            ))}
        </CardContent>
      </Card>

      {manageWordsOpen && wordsQuery.data && (
        <ManageLessonWordsDialog
          key={lesson.id}
          lesson={lesson}
          currentWords={wordsQuery.data}
          open
          onOpenChange={setManageWordsOpen}
        />
      )}
    </div>
  );
}
