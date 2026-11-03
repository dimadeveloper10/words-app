import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWordAnswerStartedAt1793285831000 implements MigrationInterface {
  name = 'AddWordAnswerStartedAt1793285831000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "word_answers" ADD COLUMN "started_at" timestamptz
    `);
    // Historical start times are unknown; use the answer time as a fallback.
    await queryRunner.query(`
      UPDATE "word_answers" SET "started_at" = "answered_at"
    `);
    await queryRunner.query(`
      ALTER TABLE "word_answers" ALTER COLUMN "started_at" SET NOT NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "word_answers" DROP COLUMN "started_at"
    `);
  }
}
