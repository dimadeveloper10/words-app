import { ArrayMinSize, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class AddTopicWordsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID('4', { each: true })
  wordIds!: string[];
}
