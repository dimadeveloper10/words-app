import { useEffect } from 'react';
import { getWordImageUrl } from './words.api';
import type { Word } from './words.types';
import { canSpeak, speakWord, stopSpeaking } from './speakWord';
import './WordCard.css';

function formatTranslation(word: Word) {
  const primary = word.translations.filter((t) => t.isPrimary);
  const shown = primary.length > 0 ? primary : word.translations.slice(0, 1);
  return shown.map((t) => t.text).join(', ');
}

export function WordCard({ word }: { word: Word }) {
  useEffect(() => {
    speakWord(word.word);
    return stopSpeaking;
  }, [word.word]);

  return (
    <article className="word-card" aria-label={word.word}>
      <label className="word-card-check">
        <input type="checkbox" disabled />
        <span className="visually-hidden">Learned</span>
      </label>
      <div className="word-card-image">
        {word.imageUrl ? (
          <img src={getWordImageUrl(word.imageUrl)} alt="" />
        ) : (
          <span aria-hidden="true">{word.word.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <h2 className="word-card-word">{word.word}</h2>
      {word.transcription && (
        <p className="word-card-transcription">{word.transcription}</p>
      )}
      <button
        type="button"
        className="word-card-sound"
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
      <p className="word-card-translation">{formatTranslation(word)}</p>
    </article>
  );
}
