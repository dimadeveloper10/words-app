import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  CreateExampleDto,
  CreateFormDto,
  CreateTranslationDto,
} from './create-word.dto';

/**
 * All fields optional. When `translations` or `forms` is provided, the service
 * replaces that whole collection; omitting it leaves the existing rows intact.
 * Written by hand because @nestjs/mapped-types (PartialType) is not installed.
 */
export class UpdateWordDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  word?: string;

  @IsOptional()
  @IsString()
  transcription?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTranslationDto)
  translations?: CreateTranslationDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFormDto)
  forms?: CreateFormDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExampleDto)
  examples?: CreateExampleDto[];
}
