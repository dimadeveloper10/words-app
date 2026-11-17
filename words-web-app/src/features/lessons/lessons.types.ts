export interface Lesson {
  id: string;
  name: string;
  slug: string;
  lessonNumber: number | null;
  imageId: string | null;
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
  wordIds: string[];
  createdAt: string;
  updatedAt: string;
}
