import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../images/images.module';
import { Word } from '../words/entities/word.entity';
import { Topic } from './entities/topic.entity';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';

@Module({
  imports: [ImagesModule, TypeOrmModule.forFeature([Topic, Word])],
  controllers: [TopicsController],
  providers: [TopicsService],
})
export class TopicsModule {}
