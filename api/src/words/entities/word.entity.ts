import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { Topic } from '../../topics/entities/topic.entity';
import { WordForm } from './word-form.entity';
import { WordTranslation } from './word-translation.entity';
import { WordExample } from './word-example.entity';

@Entity('words')
export class Word {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  word!: string;

  @Column({ type: 'varchar', nullable: true })
  transcription!: string | null;

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl!: string | null;

  // orphanedRowAction: 'delete' lets update() replace a collection by simply
  // reassigning the array — removed rows are deleted on save.
  @OneToMany(() => WordTranslation, (translation) => translation.word, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  translations!: WordTranslation[];

  @OneToMany(() => WordForm, (form) => form.word, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  forms!: WordForm[];

  @OneToMany(() => WordExample, (example) => example.word, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  examples!: WordExample[];

  @ManyToMany(() => Topic, (topic) => topic.words)
  @JoinTable({
    name: 'topic_words',
    joinColumn: {
      name: 'word_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'topic_id',
      referencedColumnName: 'id',
    },
  })
  topics!: Topic[];

  @Exclude()
  @ManyToMany(() => Lesson, (lesson) => lesson.words, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  lessons!: Lesson[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
