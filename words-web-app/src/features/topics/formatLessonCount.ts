export function formatLessonCount(count: number): string {
  return `${count} ${count === 1 ? 'lesson' : 'lessons'}`;
}
