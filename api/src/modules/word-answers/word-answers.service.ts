import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { ExerciseType } from '../exercise-types/entities/exercise-type.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { User } from '../users/entities/user.entity';
import { Word } from '../words/entities/word.entity';
import { CreateWordAnswerDto } from './dto/create-word-answer.dto';
import { WordAnswerResponseDto } from './dto/word-answer-response.dto';
import { WordAnswer } from './entities/word-answer.entity';

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

  async create(
    dto: CreateWordAnswerDto,
    user: User,
  ): Promise<{ answer: WordAnswerResponseDto; created: boolean }> {
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

    const existing = await this.findStored(dto.id);
    if (existing) {
      return this.retry(existing, dto, user.id, startedAt, answeredAt);
    }

    await this.validateReferences(dto);

    // insert never updates an existing attempt, unlike save or upsert.
    try {
      await this.answersRepository.insert({
        id: dto.id,
        user: { id: user.id },
        word: { id: dto.wordId },
        lesson: dto.lessonId ? { id: dto.lessonId } : null,
        exerciseType: { id: dto.exerciseTypeId },
        isCorrect: dto.isCorrect,
        pointsAwarded: dto.pointsAwarded,
        startedAt,
        answeredAt,
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const { code } = error.driverError as { code?: string };
        if (code === '23505') {
          // A concurrent request may have inserted the same UUID after our lookup.
          const saved = await this.findStored(dto.id);
          if (saved) {
            return this.retry(saved, dto, user.id, startedAt, answeredAt);
          }
        }
        if (code === '23503') {
          throw new ConflictException(
            'An answer reference was removed during submission; reload and try again',
          );
        }
      }
      throw error;
    }

    const saved = await this.findStored(dto.id);
    if (!saved) {
      throw new ConflictException('Answer was removed during submission');
    }
    return { answer: this.toResponse(saved), created: true };
  }

  private async validateReferences(dto: CreateWordAnswerDto): Promise<void> {
    if (!(await this.wordsRepository.existsBy({ id: dto.wordId }))) {
      throw new NotFoundException('Word not found');
    }
    if (
      !(await this.exerciseTypesRepository.existsBy({ id: dto.exerciseTypeId }))
    ) {
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
  }

  private findStored(id: string): Promise<WordAnswer | null> {
    return this.answersRepository.findOne({
      where: { id },
      relations: { user: true, word: true, lesson: true, exerciseType: true },
      select: {
        id: true,
        isCorrect: true,
        pointsAwarded: true,
        startedAt: true,
        answeredAt: true,
        createdAt: true,
        user: { id: true },
        word: { id: true },
        lesson: { id: true },
        exerciseType: { id: true },
      },
    });
  }

  private retry(
    saved: WordAnswer,
    dto: CreateWordAnswerDto,
    userId: string,
    startedAt: Date,
    answeredAt: Date,
  ): { answer: WordAnswerResponseDto; created: boolean } {
    if (
      saved.user.id !== userId ||
      saved.word.id !== dto.wordId ||
      (saved.lesson?.id ?? null) !== (dto.lessonId ?? null) ||
      saved.exerciseType.id !== dto.exerciseTypeId ||
      saved.isCorrect !== dto.isCorrect ||
      saved.pointsAwarded !== dto.pointsAwarded ||
      saved.startedAt.getTime() !== startedAt.getTime() ||
      saved.answeredAt.getTime() !== answeredAt.getTime()
    ) {
      throw new ConflictException(
        'Answer ID is already used by another attempt',
      );
    }
    return { answer: this.toResponse(saved), created: false };
  }

  private toResponse(answer: WordAnswer): WordAnswerResponseDto {
    return {
      id: answer.id,
      wordId: answer.word.id,
      lessonId: answer.lesson?.id ?? null,
      exerciseTypeId: answer.exerciseType.id,
      isCorrect: answer.isCorrect,
      pointsAwarded: answer.pointsAwarded,
      startedAt: answer.startedAt,
      answeredAt: answer.answeredAt,
      createdAt: answer.createdAt,
    };
  }
}
