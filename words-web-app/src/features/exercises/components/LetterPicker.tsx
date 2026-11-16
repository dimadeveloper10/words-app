import { useState } from 'react';
import './LetterPicker.css';

interface Tile {
  id: number;
  char: string;
}

interface LetterPickerProps {
  word: string;
  onAnswerChange: (value: string) => void;
  onComplete: (value: string) => void;
}

const MAX_SHUFFLE_ATTEMPTS = 5;

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createTiles(word: string): Tile[] {
  const tiles = [...word.trim().toLowerCase()].map((char, id) => ({
    id,
    char,
  }));
  const original = tiles.map((tile) => tile.char).join('');
  let shuffled = shuffle(tiles);
  for (
    let attempt = 1;
    attempt < MAX_SHUFFLE_ATTEMPTS &&
    shuffled.map((tile) => tile.char).join('') === original;
    attempt++
  ) {
    shuffled = shuffle(tiles);
  }
  return shuffled;
}

const removeIcon = (
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
    <path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z" />
    <path d="m17 9-5 6M12 9l5 6" />
  </svg>
);

export function LetterPicker({
  word,
  onAnswerChange,
  onComplete,
}: LetterPickerProps) {
  const [tiles] = useState(() => createTiles(word));
  const [pickedIds, setPickedIds] = useState<number[]>([]);

  function toAnswer(ids: number[]) {
    return ids
      .map((id) => tiles.find((tile) => tile.id === id)?.char ?? '')
      .join('');
  }

  function pick(tile: Tile) {
    const next = [...pickedIds, tile.id];
    const value = toAnswer(next);
    setPickedIds(next);
    onAnswerChange(value);
    if (next.length === tiles.length) {
      onComplete(value);
    }
  }

  function removeLast() {
    const next = pickedIds.slice(0, -1);
    setPickedIds(next);
    onAnswerChange(toAnswer(next));
  }

  return (
    <div className="letter-picker">
      <div className="letter-picker-inner">
        <button
          type="button"
          className="letter-picker-remove"
          aria-label="Remove letter"
          disabled={pickedIds.length === 0}
          onClick={removeLast}
        >
          {removeIcon}
        </button>
        <div className="letter-picker-tiles" role="group" aria-label="Letters">
          {tiles.map((tile) => (
            <button
              key={tile.id}
              type="button"
              className="letter-picker-tile"
              aria-label={tile.char === ' ' ? 'Space' : tile.char}
              disabled={pickedIds.includes(tile.id)}
              onClick={() => pick(tile)}
            >
              {tile.char === ' ' ? '␣' : tile.char}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
