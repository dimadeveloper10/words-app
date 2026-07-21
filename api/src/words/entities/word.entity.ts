import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WordForm } from './word-form.entity';
import { WordTranslation } from './word-translation.entity';

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
