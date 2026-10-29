import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateWordAnswerDto } from './dto/create-word-answer.dto';
import { WordAnswerResponseDto } from './dto/word-answer-response.dto';
import { WordAnswersService } from './word-answers.service';

@Controller('word-answers')
export class WordAnswersController {
  constructor(private readonly wordAnswersService: WordAnswersService) {}

  @Post()
  async create(
    @Body() dto: CreateWordAnswerDto,
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<WordAnswerResponseDto> {
    const result = await this.wordAnswersService.create(dto, user);
    response.status(result.created ? HttpStatus.CREATED : HttpStatus.OK);
    return result.answer;
  }
}
