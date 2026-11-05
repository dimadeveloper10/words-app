import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { CreateWordAnswerDto } from './create-word-answer.dto';

export const MAX_BATCH_ANSWERS = 200;

export class CreateWordAnswersBatchDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_BATCH_ANSWERS)
  @ValidateNested({ each: true })
  @Type(() => CreateWordAnswerDto)
  answers!: CreateWordAnswerDto[];
}
