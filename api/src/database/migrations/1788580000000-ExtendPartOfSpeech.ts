import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendPartOfSpeech1788580000000 implements MigrationInterface {
  name = 'ExtendPartOfSpeech1788580000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."word_translations_part_of_speech_enum" ADD VALUE 'determiner'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."word_translations_part_of_speech_enum" ADD VALUE 'article'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."word_translations_part_of_speech_enum" ADD VALUE 'particle'`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."word_translations_part_of_speech_enum" RENAME TO "word_translations_part_of_speech_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."word_translations_part_of_speech_enum" AS ENUM('noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection', 'numeral')`,
    );
    await queryRunner.query(
      `ALTER TABLE "word_translations" ALTER COLUMN "part_of_speech" TYPE "public"."word_translations_part_of_speech_enum" USING "part_of_speech"::text::"public"."word_translations_part_of_speech_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."word_translations_part_of_speech_enum_old"`,
    );
  }
}
