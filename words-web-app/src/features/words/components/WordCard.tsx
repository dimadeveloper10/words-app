import { type JSX, useEffect } from 'react';
import { formatTranslation } from '../formatTranslation';
import { Picture } from '../../../components/Picture';
import type { Word } from '../words.types';
import { canSpeak, speakWord, stopSpeaking } from '../speakWord';
import './WordCard.css';

interface WordCardProps {
  word: Word;
}

export function WordCard({ word }: WordCardProps): JSX.Element {
  useEffect(() => {
    speakWord(word.word);
    return stopSpeaking;
  }, [word.word]);

  return (
    <article className="word-card" aria-label={word.word}>
      <label className="word-card__check">
        <input className="word-card__checkbox" type="checkbox" disabled />
        <span className="visually-hidden">Learned</span>
      </label>
      <div className="word-card__image">
        {word.imageId ? (
          <Picture imageId={word.imageId} alt="" />
        ) : (
          <span aria-hidden="true">{word.word.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <h2 className="word-card__word">{word.word}</h2>
      {word.transcription && (
        <p className="word-card__transcription">{word.transcription}</p>
      )}
      <button
        type="button"
        className="word-card__sound"
        aria-label={`Play pronunciation of ${word.word}`}
        disabled={!canSpeak}
        onClick={() => speakWord(word.word)}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M19 5a10 10 0 0 1 0 14" />
        </svg>
      </button>
      <p className="word-card__translation">{formatTranslation(word)}</p>
    </article>
  );
}
