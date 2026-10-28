import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { ExerciseType } from '../../exercise-types/entities/exercise-type.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { User } from '../../users/entities/user.entity';
import { Word } from '../../words/entities/word.entity';

@Entity('word_answers')
@Index('IDX_word_answers_user_word', ['user', 'word'])
@Index('IDX_word_answers_user_lesson_exercise', [
  'user',
  'lesson',
  'exerciseType',
])
@Index('IDX_word_answers_word_id', ['word'])
@Index('IDX_word_answers_lesson_id', ['lesson'])
@Index('IDX_word_answers_exercise_type_id', ['exerciseType'])
export class WordAnswer {
  // The client supplies a stable UUID so offline retries identify the same answer.
  @PrimaryColumn({ type: 'uuid', primaryKeyConstraintName: 'PK_word_answers' })
  id!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_word_answers_user',
  })
  user!: User;

  @ManyToOne(() => Word, {
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({
    name: 'word_id',
    foreignKeyConstraintName: 'FK_word_answers_word',
  })
  word!: Word;

  @ManyToOne(() => Lesson, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({
    name: 'lesson_id',
    foreignKeyConstraintName: 'FK_word_answers_lesson',
  })
  lesson!: Lesson | null;

  @ManyToOne(() => ExerciseType, {
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({
    name: 'exercise_type_id',
    foreignKeyConstraintName: 'FK_word_answers_exercise_type',
  })
  exerciseType!: ExerciseType;

  @Column({ name: 'is_correct', type: 'boolean' })
  isCorrect!: boolean;

  @Column({ name: 'points_awarded', type: 'int' })
  pointsAwarded!: number;

  @Column({ name: 'answered_at', type: 'timestamptz' })
  answeredAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
