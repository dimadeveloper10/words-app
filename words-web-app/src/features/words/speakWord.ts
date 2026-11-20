export const canSpeak =
  typeof window !== 'undefined' && 'speechSynthesis' in window;

const SPEAK_DELAY_MS = 150;
let scheduledSpeak: ReturnType<typeof setTimeout> | undefined;

export function stopSpeaking(): void {
  if (!canSpeak) {
    return;
  }
  clearTimeout(scheduledSpeak);
  scheduledSpeak = undefined;
  const { speechSynthesis } = window;
  if (speechSynthesis.speaking || speechSynthesis.pending) {
    speechSynthesis.cancel();
  }
}

export function speakWord(text: string): void {
  if (!canSpeak) {
    return;
  }
  stopSpeaking();
  scheduledSpeak = setTimeout(() => {
    scheduledSpeak = undefined;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    window.speechSynthesis.speak(utterance);
  }, SPEAK_DELAY_MS);
}
