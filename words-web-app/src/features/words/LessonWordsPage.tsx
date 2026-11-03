import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { useLesson } from '../lessons/useLessons';
import { useLessonWords } from './useWords';
import { WordCard } from './WordCard';
import './LessonWordsPage.css';

export function LessonWordsPage() {
  const { lessonId = '' } = useParams();
  const lesson = useLesson(lessonId);
  const words = useLessonWords(lessonId);
  const [index, setIndex] = useState(0);

  if (!lesson) {
    return (
      <main className="session-page" aria-labelledby="lesson-words-title">
        <PageHeader id="lesson-words-title" title="Words" backTo="/lessons" />
        <p role="alert">Lesson not found.</p>
      </main>
    );
  }

  if (words.length === 0) {
    return (
      <main className="session-page" aria-labelledby="lesson-words-title">
        <PageHeader
          id="lesson-words-title"
          title="Words"
          backTo={`/lessons/${lesson.id}`}
        />
        <p>No words in this lesson yet.</p>
      </main>
    );
  }

  const current = Math.min(index, words.length - 1);
  const word = words[current];

  return (
    <main
      className="session-page lesson-words-page"
      aria-labelledby="lesson-words-title"
    >
      <PageHeader
        id="lesson-words-title"
        title={`${current + 1} / ${words.length}`}
        backTo={`/lessons/${lesson.id}`}
      />
      <WordCard key={word.id} word={word} />
      <nav className="word-nav" aria-label="Word navigation">
        <div className="word-nav-inner">
          <button
            type="button"
            className="auth-submit"
            disabled={current === 0}
            onClick={() => setIndex(current - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            className="auth-submit"
            disabled={current === words.length - 1}
            onClick={() => setIndex(current + 1)}
          >
            Next
          </button>
        </div>
      </nav>
    </main>
  );
}
