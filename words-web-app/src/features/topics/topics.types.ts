export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageId: string | null;
  sortOrder: number;
  wordCount: number;
  lessonCount: number;
  createdAt: string;
  updatedAt: string;
}
