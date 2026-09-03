import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Paginated } from '../common/dto/paginated';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Role } from '../common/enums/role.enum';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Topic } from './entities/topic.entity';
import { TopicsService } from './topics.service';
import { Word } from '../words/entities/word.entity';
import { AddTopicWordsDto } from './dto/add-topic-words.dto';

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto): Promise<Paginated<Topic>> {
    return this.topicsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Topic> {
    return this.topicsService.findOne(id);
  }

  @Get(':id/words')
  findWords(@Param('id', ParseUUIDPipe) id: string): Promise<Word[]> {
    return this.topicsService.findWords(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateTopicDto): Promise<Topic> {
    return this.topicsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTopicDto,
  ): Promise<Topic> {
    return this.topicsService.update(id, dto);
  }

  @Put(':id/add_words')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  addWords(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddTopicWordsDto,
  ): Promise<void> {
    return this.topicsService.addWords(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.topicsService.remove(id);
  }
}
