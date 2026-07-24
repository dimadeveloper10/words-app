import { IsOptional, IsString } from 'class-validator';

export class QueryWordsDto {
  @IsOptional()
  @IsString()
  q?: string;
}
