import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateWordDto } from './dto/create-word.dto';
import { DeleteWordsDto } from './dto/delete-words.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { Word } from './entities/word.entity';
import { WordsService } from './words.service';
import { QueryWordsDto } from './dto/query-words.dto';
import { Paginated } from '../common/dto/paginated';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get()
  findAll(@Query() query: QueryWordsDto): Promise<Paginated<Word>> {
    return this.wordsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Word> {
    return this.wordsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateWordDto): Promise<Word> {
    return this.wordsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWordDto,
  ): Promise<Word> {
    return this.wordsService.update(id, dto);
  }

  @Delete('bulk')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMany(@Body() dto: DeleteWordsDto): Promise<void> {
    return this.wordsService.removeMany(dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.wordsService.remove(id);
  }

  @Post(':id/image')
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<Word> {
    return this.wordsService.setImage(id, file);
  }
}
