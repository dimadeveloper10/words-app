export interface PendingWordAnswer {
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

export interface WordAnswerDto {
  id: string;
  wordId: string;
  lessonId: string | null;
  exerciseType: string;
  isCorrect: boolean;
  pointsAwarded: number;
  startedAt: string;
  answeredAt: string;
}

export type WordAnswer = WordAnswerDto & { isSynced: boolean };
