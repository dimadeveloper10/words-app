import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLessons1788426000000 implements MigrationInterface {
  name = 'AddLessons1788426000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "lessons" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "topic_id" uuid NOT NULL,
        "added_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_lessons_topic_name" UNIQUE ("topic_id", "name"),
        CONSTRAINT "UQ_lessons_topic_slug" UNIQUE ("topic_id", "slug"),
        CONSTRAINT "PK_lessons" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "lesson_words" (
        "lesson_id" uuid NOT NULL,
        "word_id" uuid NOT NULL,
        CONSTRAINT "PK_lesson_words" PRIMARY KEY ("lesson_id", "word_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_lesson_words_word_id"
      ON "lesson_words" ("word_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "lessons"
      ADD CONSTRAINT "FK_lessons_topic"
      FOREIGN KEY ("topic_id") REFERENCES "topics"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "lessons"
      ADD CONSTRAINT "FK_lessons_added_by"
      FOREIGN KEY ("added_by") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "lesson_words"
      ADD CONSTRAINT "FK_lesson_words_lesson"
      FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "lesson_words"
      ADD CONSTRAINT "FK_lesson_words_word"
      FOREIGN KEY ("word_id") REFERENCES "words"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "lesson_words" DROP CONSTRAINT "FK_lesson_words_word"',
    );
    await queryRunner.query(
      'ALTER TABLE "lesson_words" DROP CONSTRAINT "FK_lesson_words_lesson"',
    );
    await queryRunner.query(
      'ALTER TABLE "lessons" DROP CONSTRAINT "FK_lessons_added_by"',
    );
    await queryRunner.query(
      'ALTER TABLE "lessons" DROP CONSTRAINT "FK_lessons_topic"',
    );
    await queryRunner.query('DROP INDEX "IDX_lesson_words_word_id"');
    await queryRunner.query('DROP TABLE "lesson_words"');
    await queryRunner.query('DROP TABLE "lessons"');
  }
}
