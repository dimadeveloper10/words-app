export class FailedWordAnswerDto {
  id!: string;
  statusCode!: number;
  message!: string;
}

export class WordAnswersBatchResponseDto {
  savedIds!: string[];
  failed!: FailedWordAnswerDto[];
}
