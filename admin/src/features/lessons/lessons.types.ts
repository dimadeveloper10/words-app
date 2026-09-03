export interface LessonTopic {
  id: string;
  name: string;
  slug: string;
}

export interface LessonAuthor {
  id: string;
  name: string | null;
  email: string;
}

export interface Lesson {
  id: string;
  name: string;
  slug: string;
  topic: LessonTopic;
  addedBy: LessonAuthor | null;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonPayload {
  name: string;
  slug: string;
  topicId: string;
}

export interface UpdateLessonPayload {
  name?: string;
  slug?: string;
  wordIds?: string[];
}
