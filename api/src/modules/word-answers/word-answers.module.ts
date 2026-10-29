import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseType } from '../exercise-types/entities/exercise-type.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Word } from '../words/entities/word.entity';
import { WordAnswer } from './entities/word-answer.entity';
import { WordAnswersController } from './word-answers.controller';
import { WordAnswersService } from './word-answers.service';

@Module({
  imports: [TypeOrmModule.forFeature([WordAnswer, Word, Lesson, ExerciseType])],
  controllers: [WordAnswersController],
  providers: [WordAnswersService],
})
export class WordAnswersModule {}
