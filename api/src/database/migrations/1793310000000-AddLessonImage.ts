import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLessonImage1793310000000 implements MigrationInterface {
  name = 'AddLessonImage1793310000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lessons" ADD "image_url" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "image_url"`);
  }
}
