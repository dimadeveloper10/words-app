import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PartOfSpeech } from '../../common/enums/part-of-speech.enum';
import { Word } from './word.entity';

@Entity('word_translations')
export class WordTranslation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Word, (word) => word.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'word_id' })
  word!: Word;

  @Column({ name: 'part_of_speech', type: 'enum', enum: PartOfSpeech })
  partOfSpeech!: PartOfSpeech;

  @Column({ type: 'varchar' })
  text!: string;

  // A word can have several primary translations; no uniqueness is enforced.
  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary!: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;
}
