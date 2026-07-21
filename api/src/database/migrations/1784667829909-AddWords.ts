import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWords1784667829909 implements MigrationInterface {
  name = 'AddWords1784667829909';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."word_translations_part_of_speech_enum" AS ENUM('noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection', 'numeral')`,
    );
    await queryRunner.query(
      `CREATE TABLE "words" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "word" character varying NOT NULL, "transcription" character varying, "image_url" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_words_word" UNIQUE ("word"), CONSTRAINT "PK_words" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "word_translations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "word_id" uuid NOT NULL, "part_of_speech" "public"."word_translations_part_of_speech_enum" NOT NULL, "text" character varying NOT NULL, "is_primary" boolean NOT NULL DEFAULT false, "sort_order" integer NOT NULL DEFAULT 0, CONSTRAINT "PK_word_translations" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "word_forms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "word_id" uuid NOT NULL, "form" character varying NOT NULL, "sort_order" integer NOT NULL DEFAULT 0, CONSTRAINT "PK_word_forms" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "word_translations" ADD CONSTRAINT "FK_word_translations_word" FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "word_forms" ADD CONSTRAINT "FK_word_forms_word" FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "word_forms" DROP CONSTRAINT "FK_word_forms_word"`,
    );
    await queryRunner.query(
      `ALTER TABLE "word_translations" DROP CONSTRAINT "FK_word_translations_word"`,
    );
    await queryRunner.query(`DROP TABLE "word_forms"`);
    await queryRunner.query(`DROP TABLE "word_translations"`);
    await queryRunner.query(`DROP TABLE "words"`);
    await queryRunner.query(
      `DROP TYPE "public"."word_translations_part_of_speech_enum"`,
    );
  }
}
