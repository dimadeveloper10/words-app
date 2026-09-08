import { useState } from 'react';
import { isAxiosError } from 'axios';
import {
  AlertCircle,
  ArrowLeft,
  ArrowUp,
  ListChecks,
  Loader2,
  Plus,
} from 'lucide-react';
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
import { LessonDialog } from '@/features/lessons/LessonDialog';
import { ManageLessonWordsDialog } from '@/features/lessons/ManageLessonWordsDialog';
import type { Lesson } from '@/features/lessons/lessons.types';
import { useAuthStore } from '@/stores/auth';
import { WordDialog } from '@/features/words/word-dialog/WordDialog';
import type { Word } from '@/features/words/words.types';

type TopicTab = 'lessons' | 'words';

export function TopicDetailsPage() {
  const [activeTab, setActiveTab] = useState<TopicTab>('lessons');
  const [addingLesson, setAddingLesson] = useState(false);
  const [addingWord, setAddingWord] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [managingLessonWords, setManagingLessonWords] = useState<Lesson | null>(
    null,
  );
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role);
  const canManage = role === 'admin' || role === 'superadmin';
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

      <div className="flex items-start justify-between gap-4">
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
      </div>

      <div
        role="tablist"
        aria-label="Topic content"
        className="flex gap-1 border-b"
      >
        <button
          type="button"
          role="tab"
          id="topic-lessons-tab"
          aria-selected={activeTab === 'lessons'}
          aria-controls="topic-lessons-panel"
          tabIndex={activeTab === 'lessons' ? 0 : -1}
          className="text-muted-foreground hover:text-foreground aria-selected:text-foreground aria-selected:border-primary -mb-px border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-colors"
          onClick={() => setActiveTab('lessons')}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
              event.preventDefault();
              setActiveTab('words');
              document.getElementById('topic-words-tab')?.focus();
            }
          }}
        >
          Lessons
        </button>
        <button
          type="button"
          role="tab"
          id="topic-words-tab"
          aria-selected={activeTab === 'words'}
          aria-controls="topic-words-panel"
          tabIndex={activeTab === 'words' ? 0 : -1}
          className="text-muted-foreground hover:text-foreground aria-selected:text-foreground aria-selected:border-primary -mb-px border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-colors"
          onClick={() => setActiveTab('words')}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
              event.preventDefault();
              setActiveTab('lessons');
              document.getElementById('topic-lessons-tab')?.focus();
            }
          }}
        >
          Words
        </button>
      </div>

      <section
        role="tabpanel"
        id="topic-lessons-panel"
        aria-labelledby="topic-lessons-tab"
        hidden={activeTab !== 'lessons'}
        className="space-y-3"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Lessons</h2>
            <p className="text-muted-foreground text-sm">
              Lessons grouped under this topic.
            </p>
          </div>
          {canManage && (
            <Button onClick={() => setAddingLesson(true)}>
              <Plus className="size-4" />
              Add lesson
            </Button>
          )}
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
                      {canManage && (
                        <TableHead className="pr-6 text-right">
                          Actions
                        </TableHead>
                      )}
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
                        {canManage && (
                          <TableCell
                            className="pr-6 text-right"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              aria-label={`Manage words for ${lesson.name}`}
                              onClick={() => setManagingLessonWords(lesson)}
                            >
                              <ListChecks className="size-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ))}
          </CardContent>
        </Card>
      </section>

      <section
        role="tabpanel"
        id="topic-words-panel"
        aria-labelledby="topic-words-tab"
        hidden={activeTab !== 'words'}
        className="space-y-3"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Words</h2>
            <p className="text-muted-foreground text-sm">
              All words assigned to this topic.
            </p>
          </div>
          {canManage && (
            <Button onClick={() => setAddingWord(true)}>
              <Plus className="size-4" />
              Add word
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
                <TopicWordsTable
                  words={wordsQuery.data}
                  onEdit={canManage ? setEditingWord : undefined}
                />
              ))}
          </CardContent>
        </Card>
      </section>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUp className="size-4" />
          Back to top
        </Button>
      </div>

      {addingLesson && (
        <LessonDialog
          key={`create-${topic.id}`}
          fixedTopic={{ id: topic.id, name: topic.name }}
          open
          onOpenChange={(open) => {
            if (!open) setAddingLesson(false);
          }}
        />
      )}

      {managingLessonWords && (
        <ManageLessonWordsDialog
          key={managingLessonWords.id}
          lesson={managingLessonWords}
          open
          onOpenChange={(open) => {
            if (!open) setManagingLessonWords(null);
          }}
        />
      )}

      {addingWord && (
        <WordDialog
          key={`create-${topic.id}`}
          fixedTopic={{ id: topic.id, name: topic.name }}
          open
          onOpenChange={(open) => {
            if (!open) setAddingWord(false);
          }}
        />
      )}

      {editingWord && (
        <WordDialog
          key={editingWord.id}
          word={editingWord}
          open
          onOpenChange={(open) => {
            if (!open) setEditingWord(null);
          }}
        />
      )}
    </div>
  );
}
