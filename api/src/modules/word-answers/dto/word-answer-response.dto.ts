export class WordAnswerResponseDto {
  id!: string;
  wordId!: string;
  lessonId!: string | null;
  exerciseType!: string;
  isCorrect!: boolean;
  pointsAwarded!: number;
  startedAt!: Date;
  answeredAt!: Date;
  createdAt!: Date;
}
