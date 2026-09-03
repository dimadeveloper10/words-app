import { isAxiosError } from 'axios';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
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
import { TopicWordsTable } from './TopicWordsTable';
import { useTopic, useTopicWords } from './useTopics';
import { useLessons } from '@/features/lessons/useLessons';

export function TopicDetailsPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const topicQuery = useTopic(id);
  const wordsQuery = useTopicWords(id);
  const lessonsQuery = useLessons({ page: 1, limit: 100, topicId: id });

  if (topicQuery.isError) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/topics">
            <ArrowLeft className="size-4" />
            Back to topics
          </Link>
        </Button>
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center text-sm">
          <AlertCircle className="text-destructive size-5" />
          {isAxiosError(topicQuery.error) &&
          topicQuery.error.response?.status === 404
            ? 'Topic not found.'
            : getApiErrorMessage(topicQuery.error, 'Failed to load topic.')}
        </div>
      </div>
    );
  }

  if (topicQuery.isLoading || !topicQuery.data) {
    return (
      <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Loading topic…
      </div>
    );
  }

  const topic = topicQuery.data;

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild>
        <Link to="/topics">
          <ArrowLeft className="size-4" />
          Back to topics
        </Link>
      </Button>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {topic.name}
          </h1>
          <Badge variant="secondary">{topic.lessonCount} lessons</Badge>
          <Badge variant="secondary">{topic.wordCount} words</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          {topic.slug}
          {topic.description ? ` · ${topic.description}` : ''}
        </p>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Lessons</h2>
          <p className="text-muted-foreground text-sm">
            Lessons grouped under this topic.
          </p>
        </div>
        <Card>
          <CardContent className="px-0">
            {lessonsQuery.isLoading && (
              <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
                <Loader2 className="size-4 animate-spin" />
                Loading lessons…
              </div>
            )}
            {lessonsQuery.isError && (
              <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center text-sm">
                <AlertCircle className="text-destructive size-5" />
                {getApiErrorMessage(
                  lessonsQuery.error,
                  'Failed to load topic lessons.',
                )}
              </div>
            )}
            {lessonsQuery.data &&
              (lessonsQuery.data.items.length === 0 ? (
                <p className="text-muted-foreground py-12 text-center text-sm">
                  This topic has no lessons yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[56px] pl-6">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead className="text-right">Words</TableHead>
                      <TableHead className="pr-6">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lessonsQuery.data.items.map((lesson, index) => (
                      <TableRow
                        key={lesson.id}
                        role="button"
                        tabIndex={0}
                        className="focus-visible:ring-ring cursor-pointer focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none"
                        onClick={() => void navigate(`/lessons/${lesson.id}`)}
                        onKeyDown={(event) => {
                          if (event.target !== event.currentTarget) return;
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            void navigate(`/lessons/${lesson.id}`);
                          }
                        }}
                      >
                        <TableCell className="text-muted-foreground pl-6 tabular-nums">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {lesson.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">
                          {lesson.slug}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {lesson.wordCount}
                        </TableCell>
                        <TableCell className="text-muted-foreground pr-6">
                          {new Date(lesson.createdAt).toLocaleDateString(
                            undefined,
                            { year: 'numeric', month: 'short', day: 'numeric' },
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Words</h2>
          <p className="text-muted-foreground text-sm">
            All words assigned to this topic.
          </p>
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
                  'Failed to load topic words.',
                )}
              </div>
            )}
            {wordsQuery.data &&
              (wordsQuery.data.length === 0 ? (
                <p className="text-muted-foreground py-12 text-center text-sm">
                  This topic has no words yet.
                </p>
              ) : (
                <TopicWordsTable words={wordsQuery.data} />
              ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
