import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { DictionaryService } from './dictionary.service';
import { QueryTranscriptionDto } from './dto/query-transcription.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Get('transcription')
  @ApiOkResponse({
    schema: {
      type: 'object',
      required: ['transcription'],
      properties: { transcription: { type: 'string', nullable: true } },
    },
  })
  @Roles(Role.ADMIN)
  async findTranscription(
    @Query() query: QueryTranscriptionDto,
  ): Promise<{ transcription: string | null }> {
    return {
      transcription: await this.dictionaryService.findTranscription(query.word),
    };
  }
}
