import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExerciseTypeResponseDto } from './dto/exercise-type-response.dto';
import { ExerciseType } from './entities/exercise-type.entity';

@Injectable()
export class ExerciseTypesService {
  constructor(
    @InjectRepository(ExerciseType)
    private readonly exerciseTypesRepository: Repository<ExerciseType>,
  ) {}

  async findAll(): Promise<ExerciseTypeResponseDto[]> {
    const exerciseTypes = await this.exerciseTypesRepository.find({
      order: { type: 'ASC' },
    });
    return exerciseTypes.map(({ type, name }) => ({ type, name }));
  }
}
