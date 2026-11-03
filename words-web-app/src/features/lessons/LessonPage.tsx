import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { formatLessonTitle } from './formatLessonTitle';
import { useLesson } from './useLessons';

export function LessonPage() {
  const { lessonId = '' } = useParams();
  const lesson = useLesson(lessonId);

  return (
    <main className="session-page" aria-labelledby="lesson-page-title">
      <PageHeader
        id="lesson-page-title"
        title={lesson ? formatLessonTitle(lesson) : 'Lesson'}
        backTo="/lessons"
      />
      {!lesson && <p role="alert">Lesson not found.</p>}
    </main>
  );
}
