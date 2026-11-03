import { PageHeader } from '../../components/PageHeader';
import { getApiErrorMessage } from '../../lib/api';
import type { Topic } from '../topics/topics.types';
import { useTopics } from '../topics/useTopics';
import type { Lesson } from './lessons.types';
import { LessonsTopicItem } from './LessonsTopicItem';
import { useLessons } from './useLessons';
import './LessonsPage.css';

function groupByTopic(lessons: Lesson[]) {
  const groups = new Map<string, Lesson[]>();
  for (const lesson of lessons) {
    const group = groups.get(lesson.topic.id) ?? [];
    group.push(lesson);
    groups.set(lesson.topic.id, group);
  }
  return groups;
}

export function LessonsPage() {
  const topics = useTopics();
  const lessons = useLessons();
  const error = topics.error ?? lessons.error;
  const isFetching = topics.isFetching || lessons.isFetching;

  function retry() {
    if (topics.isError) void topics.refetch();
    if (lessons.isError) void lessons.refetch();
  }

  let content;
  if (error) {
    content = (
      <>
        <p role="alert">
          {getApiErrorMessage(error, 'Unable to load lessons.')}
        </p>
        <button className="auth-submit" onClick={retry} disabled={isFetching}>
          {isFetching ? 'Retrying…' : 'Try again'}
        </button>
      </>
    );
  } else if (!topics.isSuccess || !lessons.isSuccess) {
    content = <p role="status">Loading lessons…</p>;
  } else if (topics.data.length === 0) {
    content = <p>No topics yet.</p>;
  } else {
    content = (
      <TopicLessonsList
        topics={topics.data}
        lessonsByTopic={groupByTopic(lessons.data)}
      />
    );
  }

  return (
    <main
      className="session-page"
      aria-labelledby="lessons-page-title"
      aria-busy={topics.isPending || lessons.isPending}
    >
      <PageHeader id="lessons-page-title" title="Lessons" backTo="/" />
      {content}
    </main>
  );
}

interface TopicLessonsListProps {
  topics: Topic[];
  lessonsByTopic: Map<string, Lesson[]>;
}

function TopicLessonsList({ topics, lessonsByTopic }: TopicLessonsListProps) {
  return (
    <ul className="topic-lessons-list">
      {topics.map((topic) => (
        <LessonsTopicItem
          key={topic.id}
          topic={topic}
          lessons={lessonsByTopic.get(topic.id) ?? []}
        />
      ))}
    </ul>
  );
}
