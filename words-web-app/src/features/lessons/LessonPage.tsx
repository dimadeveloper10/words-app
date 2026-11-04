import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { CompileWordCard } from '../exercises/CompileWordCard';
import { formatLessonTitle } from './formatLessonTitle';
import { LessonWordsCard } from './LessonWordsCard';
import { useLesson } from './useLessons';
import './LessonPage.css';

export function LessonPage() {
  const { lessonId = '' } = useParams();
  const lesson = useLesson(lessonId);

  if (!lesson) {
    return (
      <main className="session-page" aria-labelledby="lesson-page-title">
        <PageHeader id="lesson-page-title" title="Lesson" backTo="/lessons" />
        <p role="alert">Lesson not found.</p>
      </main>
    );
  }

  return (
    <main className="session-page" aria-labelledby="lesson-page-title">
      <PageHeader
        id="lesson-page-title"
        title={formatLessonTitle(lesson)}
        backTo="/lessons"
      />
      <dl className="lesson-stats" aria-label="Lesson summary">
        <div>
          <dt>Points</dt>
          <dd>
            <span aria-label="Not available">—</span>
          </dd>
        </div>
        <div>
          <dt>Words</dt>
          <dd>{lesson.wordCount}</dd>
        </div>
      </dl>
      <ul className="exercise-grid" aria-label="Lesson activities">
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
