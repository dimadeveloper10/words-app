import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLessonNumber1788660000000 implements MigrationInterface {
  name = 'AddLessonNumber1788660000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "lessons" ADD COLUMN "lesson_number" integer',
    );
    await queryRunner.query(
      'ALTER TABLE "lessons" ADD CONSTRAINT "UQ_lessons_lesson_number" UNIQUE ("lesson_number")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "lessons" DROP CONSTRAINT "UQ_lessons_lesson_number"',
    );
    await queryRunner.query(
      'ALTER TABLE "lessons" DROP COLUMN "lesson_number"',
    );
  }
}
