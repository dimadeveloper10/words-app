import { useState } from 'react';

type InputMode = 'keyboard' | 'letters';

interface InputModeState {
  isLetters: boolean;
  toggleInputMode: () => void;
}

const INPUT_MODE_KEY = 'compileWord.inputMode';

function readInputMode(): InputMode {
  try {
    return localStorage.getItem(INPUT_MODE_KEY) === 'letters'
      ? 'letters'
      : 'keyboard';
  } catch {
    return 'keyboard';
  }
}

function saveInputMode(mode: InputMode): void {
  try {
    localStorage.setItem(INPUT_MODE_KEY, mode);
  } catch {
    return;
  }
}

export function useInputMode(): InputModeState {
  const [inputMode, setInputMode] = useState<InputMode>(readInputMode);
  const isLetters = inputMode === 'letters';

  function toggleInputMode(): void {
    const next: InputMode = isLetters ? 'keyboard' : 'letters';
    setInputMode(next);
    saveInputMode(next);
  }

  return { isLetters, toggleInputMode };
}
