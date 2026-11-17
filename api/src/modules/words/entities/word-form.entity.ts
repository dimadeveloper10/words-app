import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Word } from './word.entity';

@Entity('word_forms')
export class WordForm {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Word, (word) => word.forms, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'word_id',
    foreignKeyConstraintName: 'FK_word_forms_word',
  })
  word!: Word;

  // An additional inflected form of the headword, e.g. did, done, men, children.
  @Column({ type: 'varchar' })
  form!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;
}
