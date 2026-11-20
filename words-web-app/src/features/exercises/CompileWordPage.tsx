import type { JSX } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { useLessonWords } from '../words/useWords';
import { CompileWordExercise } from './components/CompileWordExercise';

export function CompileWordPage(): JSX.Element {
  const { lessonId = '' } = useParams();
  const words = useLessonWords(lessonId);

  if (words.length === 0) {
    return (
      <main className="page" aria-labelledby="compile-word-title">
        <PageHeader
          id="compile-word-title"
          title="Compile word"
          backTo={`/lessons/${lessonId}`}
        />
        <p>No words in this lesson yet.</p>
      </main>
    );
  }

  return <CompileWordExercise lessonId={lessonId} words={words} />;
}
