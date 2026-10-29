export class WordAnswerResponseDto {
  id!: string;
  wordId!: string;
  lessonId!: string | null;
  exerciseTypeId!: string;
  isCorrect!: boolean;
  pointsAwarded!: number;
  startedAt!: Date;
  answeredAt!: Date;
  createdAt!: Date;
}
