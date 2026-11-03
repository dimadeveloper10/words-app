export const canSpeak =
  typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speakWord(text: string) {
  if (!canSpeak) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  window.speechSynthesis.speak(utterance);
}
