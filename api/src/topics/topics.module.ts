import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Word } from '../words/entities/word.entity';
import { Topic } from './entities/topic.entity';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Topic, Word])],
  controllers: [TopicsController],
  providers: [TopicsService],
})
export class TopicsModule {}
