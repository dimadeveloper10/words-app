import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Word } from './word.entity';

@Entity('word_examples')
export class WordExample {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Word, (word) => word.examples, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'word_id' })
  word!: Word;

  // Example sentence using the headword, e.g. "Give me a hand".
  @Column({ type: 'varchar' })
  text!: string;

  // Ukrainian translation of the example sentence.
  @Column({ type: 'varchar', nullable: true })
  translation!: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;
}
