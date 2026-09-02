import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { PartOfSpeech } from '../../common/enums/part-of-speech.enum';

export class CreateTranslationDto {
  @IsEnum(PartOfSpeech)
  partOfSpeech!: PartOfSpeech;

  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class CreateFormDto {
  @IsString()
  @IsNotEmpty()
  form!: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class CreateExampleDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsOptional()
  @IsString()
  translation?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class CreateWordDto {
  @IsString()
  @IsNotEmpty()
  word!: string;

  @IsOptional()
  @IsString()
  transcription?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  topicIds?: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTranslationDto)
  translations!: CreateTranslationDto[];

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
