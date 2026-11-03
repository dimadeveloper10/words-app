import type { Word } from '../features/words/words.types';
import type { CatalogState } from './catalog';

export const selectTopics = (state: CatalogState) => state.topics;

export const selectTopic = (state: CatalogState, id: string) =>
  state.topics.find((topic) => topic.id === id);

export const selectLessons = (state: CatalogState) => state.lessons;

export const selectTopicLessons = (state: CatalogState, topicId: string) =>
  state.lessons.filter((lesson) => lesson.topic.id === topicId);

export const selectLesson = (state: CatalogState, id: string) =>
  state.lessons.find((lesson) => lesson.id === id);

export const selectWord = (state: CatalogState, id: string): Word | undefined =>
  state.wordsById[id];

export const selectLessonWords = (state: CatalogState, lessonId: string) =>
  (selectLesson(state, lessonId)?.wordIds ?? []).flatMap((id) => {
    const word = selectWord(state, id);
    return word ? [word] : [];
  });
