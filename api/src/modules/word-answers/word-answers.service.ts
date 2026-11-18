import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { Paginated, paginated } from '../../common/dto/paginated';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ExerciseType } from '../exercise-types/entities/exercise-type.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { User } from '../users/entities/user.entity';
import { Word } from '../words/entities/word.entity';
import { CreateWordAnswerDto } from './dto/create-word-answer.dto';
import { WordAnswerResponseDto } from './dto/word-answer-response.dto';
import { WordAnswersBatchResponseDto } from './dto/word-answers-batch-response.dto';
import { WordAnswer } from './entities/word-answer.entity';

const ANSWER_RELATIONS = {
  word: true,
  lesson: true,
  exerciseType: true,
} satisfies FindOptionsRelations<WordAnswer>;

const ANSWER_SELECT = {
  id: true,
  isCorrect: true,
  pointsAwarded: true,
  startedAt: true,
  answeredAt: true,
  createdAt: true,
  word: { id: true },
  lesson: { id: true },
  exerciseType: { id: true, type: true },
} satisfies FindOptionsSelect<WordAnswer>;

interface AttemptTimes {
  startedAt: Date;
  answeredAt: Date;
}

type CreateResult = { answer: WordAnswerResponseDto; created: boolean };

@Injectable()
export class WordAnswersService {
  constructor(
    @InjectRepository(WordAnswer)
    private readonly answersRepository: Repository<WordAnswer>,
    @InjectRepository(Word)
    private readonly wordsRepository: Repository<Word>,
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,
    @InjectRepository(ExerciseType)
    private readonly exerciseTypesRepository: Repository<ExerciseType>,
  ) {}

  async findAll(
    { page, limit }: PaginationQueryDto,
    user: User,
  ): Promise<Paginated<WordAnswerResponseDto>> {
    const [answers, total] = await this.answersRepository.findAndCount({
      where: { user: { id: user.id } },
      relations: ANSWER_RELATIONS,
      select: ANSWER_SELECT,
      order: { answeredAt: 'ASC', id: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return paginated(
      answers.map((answer) => this.toResponse(answer)),
      total,
      page,
      limit,
    );
  }

  async create(dto: CreateWordAnswerDto, user: User): Promise<CreateResult> {
    const times = this.parseAttemptTimes(dto);

    const existing = await this.findStored(dto.id);
    if (existing) {
      return this.retry(existing, dto, user.id, times);
    }

    const exerciseType = await this.validateReferences(dto);

    // insert never updates an existing attempt, unlike save or upsert.
    try {
      await this.answersRepository.insert({
        id: dto.id,
        user: { id: user.id },
        word: { id: dto.wordId },
        lesson: dto.lessonId ? { id: dto.lessonId } : null,
        exerciseType: { id: exerciseType.id },
        isCorrect: dto.isCorrect,
        pointsAwarded: dto.pointsAwarded,
        ...times,
      });
    } catch (error) {
      return this.handleInsertError(error, dto, user.id, times);
    }

    const saved = await this.findStored(dto.id);
    if (!saved) {
      throw new ConflictException('Answer was removed during submission');
    }
    return { answer: this.toResponse(saved), created: true };
  }

  async createMany(
    dtos: CreateWordAnswerDto[],
    user: User,
  ): Promise<WordAnswersBatchResponseDto> {
    const result: WordAnswersBatchResponseDto = { savedIds: [], failed: [] };
    for (const dto of dtos) {
      try {
        await this.create(dto, user);
        result.savedIds.push(dto.id);
      } catch (error) {
        if (!(error instanceof HttpException)) {
          throw error;
        }
        result.failed.push({
          id: dto.id,
          statusCode: error.getStatus(),
          message: error.message,
        });
      }
    }
    return result;
  }

  private async validateReferences(
    dto: CreateWordAnswerDto,
  ): Promise<ExerciseType> {
    if (!(await this.wordsRepository.existsBy({ id: dto.wordId }))) {
      throw new NotFoundException('Word not found');
    }
    const exerciseType = await this.exerciseTypesRepository.findOneBy({
      type: dto.exerciseType,
    });
    if (!exerciseType) {
      throw new NotFoundException('Exercise type not found');
    }
    if (dto.lessonId) {
      if (!(await this.lessonsRepository.existsBy({ id: dto.lessonId }))) {
        throw new NotFoundException('Lesson not found');
      }
      if (
        !(await this.wordsRepository.existsBy({
          id: dto.wordId,
          lessons: { id: dto.lessonId },
        }))
      ) {
        throw new BadRequestException('Word does not belong to this lesson');
      }
    }
    return exerciseType;
  }

  private parseAttemptTimes(dto: CreateWordAnswerDto): AttemptTimes {
    const startedAt = new Date(dto.startedAt);
    const answeredAt = new Date(dto.answeredAt);
    if (
      !Number.isFinite(startedAt.getTime()) ||
      !Number.isFinite(answeredAt.getTime()) ||
      startedAt > answeredAt
    ) {
      throw new BadRequestException(
        'startedAt and answeredAt must be valid dates, with startedAt no later than answeredAt',
      );
    }
    return { startedAt, answeredAt };
  }

  private async handleInsertError(
    error: unknown,
    dto: CreateWordAnswerDto,
    userId: string,
    times: AttemptTimes,
  ): Promise<CreateResult> {
    if (!(error instanceof QueryFailedError)) {
      throw error;
    }
    const { code } = error.driverError as { code?: string };
    if (code === '23505') {
      // A concurrent request may have inserted the same UUID after our lookup.
      const saved = await this.findStored(dto.id);
      if (saved) {
        return this.retry(saved, dto, userId, times);
      }
    }
    if (code === '23503') {
      throw new ConflictException(
        'An answer reference was removed during submission; reload and try again',
      );
    }
    throw error;
  }

  private findStored(id: string): Promise<WordAnswer | null> {
    return this.answersRepository.findOne({
      where: { id },
      relations: { user: true, ...ANSWER_RELATIONS },
      select: { user: { id: true }, ...ANSWER_SELECT },
    });
  }

  private retry(
    saved: WordAnswer,
    dto: CreateWordAnswerDto,
    userId: string,
    times: AttemptTimes,
  ): CreateResult {
    if (!this.isSameAttempt(saved, dto, userId, times)) {
      throw new ConflictException(
        'Answer ID is already used by another attempt',
      );
    }
    return { answer: this.toResponse(saved), created: false };
  }

  private isSameAttempt(
    saved: WordAnswer,
    dto: CreateWordAnswerDto,
    userId: string,
    times: AttemptTimes,
  ): boolean {
    const pairs: [unknown, unknown][] = [
      [saved.user.id, userId],
      [saved.word.id, dto.wordId],
      [saved.lesson?.id ?? null, dto.lessonId ?? null],
      [saved.exerciseType.type, dto.exerciseType],
      [saved.isCorrect, dto.isCorrect],
      [saved.pointsAwarded, dto.pointsAwarded],
      [saved.startedAt.getTime(), times.startedAt.getTime()],
      [saved.answeredAt.getTime(), times.answeredAt.getTime()],
    ];
    return pairs.every(([stored, sent]) => stored === sent);
  }

  private toResponse(answer: WordAnswer): WordAnswerResponseDto {
    return {
      id: answer.id,
      wordId: answer.word.id,
      lessonId: answer.lesson?.id ?? null,
      exerciseType: answer.exerciseType.type,
      isCorrect: answer.isCorrect,
      pointsAwarded: answer.pointsAwarded,
      startedAt: answer.startedAt,
      answeredAt: answer.answeredAt,
      createdAt: answer.createdAt,
    };
  }
}
