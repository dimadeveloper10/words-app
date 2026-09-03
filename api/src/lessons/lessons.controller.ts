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
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Paginated } from '../common/dto/paginated';
import { Role } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { Word } from '../words/entities/word.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { QueryLessonsDto } from './dto/query-lessons.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './entities/lesson.entity';
import { LessonsService } from './lessons.service';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  findAll(@Query() query: QueryLessonsDto): Promise<Paginated<Lesson>> {
    return this.lessonsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Lesson> {
    return this.lessonsService.findOne(id);
  }

  @Get(':id/words')
  findWords(@Param('id', ParseUUIDPipe) id: string): Promise<Word[]> {
    return this.lessonsService.findWords(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(
    @Body() dto: CreateLessonDto,
    @CurrentUser() currentUser: User,
  ): Promise<Lesson> {
    return this.lessonsService.create(dto, currentUser);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLessonDto,
  ): Promise<Lesson> {
    return this.lessonsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.lessonsService.remove(id);
  }
}
