import type { JSX } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { useLessonPoints } from '../word-answers/useWordAnswers';
import { CompileWordCard } from '../exercises/components/CompileWordCard';
import { formatLessonTitle } from './formatLessonTitle';
import { LessonWordsCard } from './components/LessonWordsCard';
import { useLesson } from './useLessons';
import './LessonPage.css';

export function LessonPage(): JSX.Element {
  const { lessonId = '' } = useParams();
  const lesson = useLesson(lessonId);
  const points = useLessonPoints(lessonId);

  if (!lesson) {
    return (
      <main className="page" aria-labelledby="lesson-page-title">
        <PageHeader id="lesson-page-title" title="Lesson" backTo="/lessons" />
        <p role="alert">Lesson not found.</p>
      </main>
    );
  }

  return (
    <main className="page" aria-labelledby="lesson-page-title">
      <PageHeader
        id="lesson-page-title"
        title={formatLessonTitle(lesson)}
        backTo="/lessons"
      />
      <dl className="lesson-page__stats" aria-label="Lesson summary">
        <div>
          <dt className="lesson-page__stat-label">Points</dt>
          <dd className="lesson-page__stat-value">{points}</dd>
        </div>
        <div>
          <dt className="lesson-page__stat-label">Words</dt>
          <dd className="lesson-page__stat-value">{lesson.wordCount}</dd>
        </div>
      </dl>
      <ul className="lesson-page__activities" aria-label="Lesson activities">
        <li>
          <LessonWordsCard lessonId={lesson.id} wordCount={lesson.wordCount} />
        </li>
        <li>
          <CompileWordCard lessonId={lesson.id} />
        </li>
      </ul>
    </main>
  );
}
