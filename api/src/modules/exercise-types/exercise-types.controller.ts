import { Controller, Get } from '@nestjs/common';
import { ExerciseTypeResponseDto } from './dto/exercise-type-response.dto';
import { ExerciseTypesService } from './exercise-types.service';

@Controller('exercise-types')
export class ExerciseTypesController {
  constructor(private readonly exerciseTypesService: ExerciseTypesService) {}

  @Get()
  findAll(): Promise<ExerciseTypeResponseDto[]> {
    return this.exerciseTypesService.findAll();
  }
}
