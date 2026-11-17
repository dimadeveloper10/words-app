import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../images/images.module';
import { Topic } from '../topics/entities/topic.entity';
import { User } from '../users/entities/user.entity';
import { Word } from '../words/entities/word.entity';
import { Lesson } from './entities/lesson.entity';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';

@Module({
  imports: [
    ImagesModule,
    TypeOrmModule.forFeature([Lesson, Topic, Word, User]),
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
