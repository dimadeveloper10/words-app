import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowDuplicateLessonNames1788740000000 implements MigrationInterface {
  name = 'AllowDuplicateLessonNames1788740000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "lessons" DROP CONSTRAINT "UQ_lessons_topic_name"',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "lessons" ADD CONSTRAINT "UQ_lessons_topic_name" UNIQUE ("topic_id", "name")',
    );
  }
}
