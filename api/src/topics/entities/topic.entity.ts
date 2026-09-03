import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VirtualColumn,
} from 'typeorm';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { Word } from '../../words/entities/word.entity';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  name!: string;

  @Column({ type: 'varchar', unique: true })
  slug!: string;

  @Column({ type: 'varchar', nullable: true })
  description!: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Exclude()
  @ManyToMany(() => Word, (word) => word.topics)
  words!: Word[];

  @Exclude()
  @OneToMany(() => Lesson, (lesson) => lesson.topic)
  lessons!: Lesson[];

  @VirtualColumn({
    type: 'int',
    query: (alias) =>
      `SELECT COUNT(*)::int FROM "topic_words" "topic_words" WHERE "topic_words"."topic_id" = ${alias}."id"`,
  })
  wordCount!: number;

  @VirtualColumn({
    type: 'int',
    query: (alias) =>
      `SELECT COUNT(*)::int FROM "lessons" "lessons" WHERE "lessons"."topic_id" = ${alias}."id"`,
  })
  lessonCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
