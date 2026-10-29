import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExerciseType } from './entities/exercise-type.entity';

@Injectable()
export class ExerciseTypesService {
  constructor(
    @InjectRepository(ExerciseType)
    private readonly exerciseTypesRepository: Repository<ExerciseType>,
  ) {}

  findAll(): Promise<ExerciseType[]> {
    return this.exerciseTypesRepository.find({ order: { type: 'ASC' } });
  }
}
