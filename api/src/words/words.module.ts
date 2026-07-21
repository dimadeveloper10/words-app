import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WordForm } from './entities/word-form.entity';
import { WordTranslation } from './entities/word-translation.entity';
import { Word } from './entities/word.entity';
import { WordsController } from './words.controller';
import { WordsService } from './words.service';

@Module({
  imports: [TypeOrmModule.forFeature([Word, WordTranslation, WordForm])],
  controllers: [WordsController],
  providers: [WordsService],
  exports: [WordsService],
})
export class WordsModule {}
