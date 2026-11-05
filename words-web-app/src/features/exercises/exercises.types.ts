export interface WordAnswer {
  id: string;
  wordId: string;
  startedAt: Date;
  answeredAt: Date;
  isCorrect: boolean;
}

export interface FailedWordAnswer {
  id: string;
  statusCode: number;
  message: string;
}

export interface SaveWordAnswersResult {
  savedIds: string[];
  failed: FailedWordAnswer[];
}
