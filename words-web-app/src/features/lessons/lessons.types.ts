export interface Lesson {
  id: string;
  name: string;
  slug: string;
  lessonNumber: number | null;
  topic: {
    id: string;
    name: string;
    slug: string;
  };
  addedBy: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}
