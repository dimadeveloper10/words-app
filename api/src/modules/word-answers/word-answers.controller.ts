import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { Paginated } from '../../common/dto/paginated';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateWordAnswerDto } from './dto/create-word-answer.dto';
import { CreateWordAnswersBatchDto } from './dto/create-word-answers-batch.dto';
import { WordAnswerResponseDto } from './dto/word-answer-response.dto';
import { WordAnswersBatchResponseDto } from './dto/word-answers-batch-response.dto';
import { WordAnswersService } from './word-answers.service';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

@Controller('word-answers')
export class WordAnswersController {
  constructor(private readonly wordAnswersService: WordAnswersService) {}

  @Get()
  @ApiPaginatedResponse(WordAnswerResponseDto)
  findAll(
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: User,
  ): Promise<Paginated<WordAnswerResponseDto>> {
    return this.wordAnswersService.findAll(query, user);
  }

  @Post()
  @ApiCreatedResponse({
    type: WordAnswerResponseDto,
    description: 'New attempt saved',
  })
  @ApiOkResponse({
    type: WordAnswerResponseDto,
    description: 'Identical retry; existing attempt returned',
  })
  @ApiConflictResponse({
    description: 'Answer UUID already used for a different attempt',
  })
  async create(
    @Body() dto: CreateWordAnswerDto,
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<WordAnswerResponseDto> {
    const result = await this.wordAnswersService.create(dto, user);
    response.status(result.created ? HttpStatus.CREATED : HttpStatus.OK);
    return result.answer;
  }

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: WordAnswersBatchResponseDto,
    description:
      'Each answer saved independently; savedIds lists new and identical-retry answers, failed lists rejected ones with their HTTP status',
  })
  createMany(
    @Body() dto: CreateWordAnswersBatchDto,
    @CurrentUser() user: User,
  ): Promise<WordAnswersBatchResponseDto> {
    return this.wordAnswersService.createMany(dto.answers, user);
  }
}
