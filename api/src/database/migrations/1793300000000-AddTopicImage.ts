import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTopicImage1793300000000 implements MigrationInterface {
  name = 'AddTopicImage1793300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "topics" ADD "image_url" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "topics" DROP COLUMN "image_url"`);
  }
}
