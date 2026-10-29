import { Controller, Get } from '@nestjs/common';
import { ExerciseType } from './entities/exercise-type.entity';
import { ExerciseTypesService } from './exercise-types.service';

@Controller('exercise-types')
export class ExerciseTypesController {
  constructor(private readonly exerciseTypesService: ExerciseTypesService) {}

  @Get()
  findAll(): Promise<ExerciseType[]> {
    return this.exerciseTypesService.findAll();
  }
}
