import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { getApiErrorMessage } from '../../lib/api';
import { formatLessonTitle } from './formatLessonTitle';
import { useLesson } from './useLessons';

export function LessonPage() {
  const { lessonId = '' } = useParams();
  const lesson = useLesson(lessonId);

  return (
    <main
      className="session-page"
      aria-labelledby="lesson-page-title"
      aria-busy={lesson.isPending}
    >
      <PageHeader
        id="lesson-page-title"
        title={
          lesson.data
            ? formatLessonTitle(lesson.data)
            : lesson.isError
              ? 'Lesson'
              : 'Loading lesson…'
        }
        backTo="/lessons"
      />
      {lesson.isError && (
        <>
          <p role="alert">
            {getApiErrorMessage(lesson.error, 'Unable to load this lesson.')}
          </p>
          <button
            className="auth-submit"
            onClick={() => void lesson.refetch()}
            disabled={lesson.isFetching}
          >
            {lesson.isFetching ? 'Retrying…' : 'Try again'}
          </button>
        </>
      )}
    </main>
  );
}
