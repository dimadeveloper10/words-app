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

  @ManyToOne(() => Word, (word) => word.forms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'word_id' })
  word!: Word;

  // An additional inflected form of the headword, e.g. did, done, men, children.
  @Column({ type: 'varchar' })
  form!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;
}
