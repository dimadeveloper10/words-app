import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('exercise_types')
@Unique('UQ_exercise_types_type', ['type'])
export class ExerciseType {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_exercise_types',
  })
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  type!: string;
}
