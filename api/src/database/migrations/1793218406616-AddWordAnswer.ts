import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWordAnswer1793218406616 implements MigrationInterface {
  name = 'AddWordAnswer1793218406616';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "exercise_types" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "type" character varying NOT NULL,
        CONSTRAINT "PK_exercise_types" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_exercise_types_type" UNIQUE ("type")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "exercise_types" ("name", "type") VALUES
        ('Compile word', 'compile_word'),
        ('Choose translation', 'choose_translation')
    `);

    await queryRunner.query(`
      CREATE TABLE "word_answers" (
        "id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "word_id" uuid NOT NULL,
        "lesson_id" uuid,
        "exercise_type_id" uuid NOT NULL,
        "is_correct" boolean NOT NULL,
        "points_awarded" integer NOT NULL,
        "answered_at" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_word_answers" PRIMARY KEY ("id"),
        CONSTRAINT "FK_word_answers_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_word_answers_word" FOREIGN KEY ("word_id")
          REFERENCES "words"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_word_answers_lesson" FOREIGN KEY ("lesson_id")
          REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
        CONSTRAINT "FK_word_answers_exercise_type" FOREIGN KEY ("exercise_type_id")
          REFERENCES "exercise_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_word_answers_user_word"
      ON "word_answers" ("user_id", "word_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_word_answers_user_lesson_exercise"
      ON "word_answers" ("user_id", "lesson_id", "exercise_type_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_word_answers_word_id" ON "word_answers" ("word_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_word_answers_lesson_id" ON "word_answers" ("lesson_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_word_answers_exercise_type_id"
      ON "word_answers" ("exercise_type_id")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "word_answers"');
    await queryRunner.query('DROP TABLE "exercise_types"');
  }
}
