import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTopicDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsUUID('4')
  imageId?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
