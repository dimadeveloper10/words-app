import type { CatalogState } from './catalog';

export const selectTopics = (state: CatalogState) => state.topics;

export const selectTopic = (state: CatalogState, id: string) =>
  state.topics.find((topic) => topic.id === id);

export const selectLessons = (state: CatalogState) => state.lessons;

export const selectTopicLessons = (state: CatalogState, topicId: string) =>
  state.lessons.filter((lesson) => lesson.topic.id === topicId);

export const selectLesson = (state: CatalogState, id: string) =>
  state.lessons.find((lesson) => lesson.id === id);
