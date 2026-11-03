import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsISO8601,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';

function normalizeUuid({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.toLowerCase() : value;
}

export class CreateWordAnswerDto {
  @Transform(normalizeUuid)
  @IsUUID('4')
  id!: string;

  @Transform(normalizeUuid)
  @IsUUID('4')
  wordId!: string;

  @IsOptional()
  @Transform(normalizeUuid)
  @IsUUID('4')
  lessonId?: string | null;

  @IsString()
  @IsNotEmpty()
  exerciseType!: string;

  @IsBoolean()
  isCorrect!: boolean;

  @IsInt()
  @Min(-2147483648)
  @Max(2147483647)
  pointsAwarded!: number;

  @IsISO8601({ strict: true, strictSeparator: true })
  @Matches(/T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/, {
    message:
      'startedAt must include seconds and a timezone, with at most 3 fractional digits',
  })
  startedAt!: string;

  @IsISO8601({ strict: true, strictSeparator: true })
  @Matches(/T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/, {
    message:
      'answeredAt must include seconds and a timezone, with at most 3 fractional digits',
  })
  answeredAt!: string;
}
