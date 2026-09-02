import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VirtualColumn,
} from 'typeorm';
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

  @VirtualColumn({
    type: 'int',
    query: (alias) =>
      `SELECT COUNT(*)::int FROM "topic_words" "topic_words" WHERE "topic_words"."topic_id" = ${alias}."id"`,
  })
  wordCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
