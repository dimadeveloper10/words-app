import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class QueryTranscriptionDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'word must contain a non-whitespace character' })
  @MaxLength(100)
  word!: string;
}
