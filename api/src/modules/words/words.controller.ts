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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateWordDto } from './dto/create-word.dto';
import { DeleteWordsDto } from './dto/delete-words.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { Word } from './entities/word.entity';
import { WordsService } from './words.service';
import { QueryWordsDto } from './dto/query-words.dto';
import { Paginated } from '../../common/dto/paginated';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiImageUpload } from '../../common/decorators/api-image-upload.decorator';
import { imageFilePipe } from '../../common/pipes/image-file.pipe';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';

@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get()
  @ApiPaginatedResponse(Word)
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
  @ApiImageUpload()
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(imageFilePipe()) file: Express.Multer.File,
  ): Promise<Word> {
    return this.wordsService.setImage(id, file);
  }
}
