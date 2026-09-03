export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TopicPayload {
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
}
