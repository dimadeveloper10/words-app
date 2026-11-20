import type { Lesson } from '../features/lessons/lessons.types';
import type { Topic } from '../features/topics/topics.types';
import type { Word } from '../features/words/words.types';
import type { CatalogState } from './catalog';

export const selectTopics = (state: CatalogState): Topic[] => state.topics;

export const selectTopic = (
  state: CatalogState,
  id: string,
): Topic | undefined => state.topics.find((topic) => topic.id === id);

export const selectLessons = (state: CatalogState): Lesson[] => state.lessons;

export const selectTopicLessons = (
  state: CatalogState,
  topicId: string,
): Lesson[] => state.lessons.filter((lesson) => lesson.topic.id === topicId);

export const selectLesson = (
  state: CatalogState,
  id: string,
): Lesson | undefined => state.lessons.find((lesson) => lesson.id === id);

export const selectWords = (state: CatalogState): Word[] => state.words;

export const selectWord = (state: CatalogState, id: string): Word | undefined =>
  state.words.find((word) => word.id === id);

export const selectLessonWords = (
  state: CatalogState,
  lessonId: string,
): Word[] =>
  (selectLesson(state, lessonId)?.wordIds ?? []).flatMap((id) => {
    const word = selectWord(state, id);
    return word ? [word] : [];
  });
