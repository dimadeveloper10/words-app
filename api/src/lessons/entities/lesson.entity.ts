import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  VirtualColumn,
} from 'typeorm';
import { Topic } from '../../topics/entities/topic.entity';
import { User } from '../../users/entities/user.entity';
import { Word } from '../../words/entities/word.entity';

@Entity('lessons')
@Unique('UQ_lessons_topic_slug', ['topic', 'slug'])
@Unique('UQ_lessons_lesson_number', ['lessonNumber'])
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  slug!: string;

  @Column({ name: 'lesson_number', type: 'int', nullable: true })
  lessonNumber!: number | null;

  @ManyToOne(() => Topic, (topic) => topic.lessons, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'topic_id',
    foreignKeyConstraintName: 'FK_lessons_topic',
  })
  topic!: Topic;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'added_by',
    foreignKeyConstraintName: 'FK_lessons_added_by',
  })
  addedBy!: User | null;

  @Exclude()
  @ManyToMany(() => Word, (word) => word.lessons, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  @JoinTable({
    name: 'lesson_words',
    joinColumn: {
      name: 'lesson_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_lesson_words_lesson',
    },
    inverseJoinColumn: {
      name: 'word_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_lesson_words_word',
    },
  })
  words!: Word[];

  @VirtualColumn({
    type: 'int',
    query: (alias) =>
      `SELECT COUNT(*)::int FROM "lesson_words" "lesson_words" WHERE "lesson_words"."lesson_id" = ${alias}."id"`,
  })
  wordCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
