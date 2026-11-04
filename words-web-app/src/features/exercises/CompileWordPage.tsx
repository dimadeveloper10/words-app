import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { useLesson } from '../lessons/useLessons';
import { formatTranslation } from '../words/formatTranslation';
import { useLessonWords } from '../words/useWords';
import { ExerciseHeader } from './ExerciseHeader';
import './CompileWordPage.css';

export function CompileWordPage() {
  const { lessonId = '' } = useParams();
  const lesson = useLesson(lessonId);
  const words = useLessonWords(lessonId);
  const [answer, setAnswer] = useState('');

  if (!lesson) {
    return (
      <main className="session-page" aria-labelledby="compile-word-title">
        <PageHeader
          id="compile-word-title"
          title="Compile word"
          backTo="/lessons"
        />
        <p role="alert">Lesson not found.</p>
      </main>
    );
  }

  if (words.length === 0) {
    return (
      <main className="session-page" aria-labelledby="compile-word-title">
        <PageHeader
          id="compile-word-title"
          title="Compile word"
          backTo={`/lessons/${lesson.id}`}
        />
        <p>No words in this lesson yet.</p>
      </main>
    );
  }

  const word = words[0];

  return (
    <main
      className="session-page compile-word-page"
      aria-labelledby="compile-word-title"
    >
      <ExerciseHeader
        id="compile-word-title"
        title={`1 / ${words.length}`}
        closeTo={`/lessons/${lesson.id}`}
      />
      <section className="compile-word-body">
        <p id="compile-word-prompt" className="compile-word-translation">
          {formatTranslation(word)}
        </p>
        <input
          className="compile-word-input"
          aria-labelledby="compile-word-prompt"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          autoFocus
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
      </section>
    </main>
  );
}
