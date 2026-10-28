import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonsModule } from '../lessons/lessons.module';
import { Topic } from '../topics/entities/topic.entity';
import { WordForm } from './entities/word-form.entity';
import { WordTranslation } from './entities/word-translation.entity';
import { Word } from './entities/word.entity';
import { WordsController } from './words.controller';
import { WordsService } from './words.service';
import { WordExample } from './entities/word-example.entity';

@Module({
  imports: [
    LessonsModule,
    TypeOrmModule.forFeature([
      Word,
      WordTranslation,
      WordForm,
      WordExample,
      Topic,
    ]),
  ],
  controllers: [WordsController],
  providers: [WordsService],
  exports: [WordsService],
})
export class WordsModule {}
