import { MigrationInterface, QueryRunner } from 'typeorm';

const TABLES = ['words', 'topics', 'lessons'];

export class ReplaceImageUrlWithImageId1794934212049 implements MigrationInterface {
  name = 'ReplaceImageUrlWithImageId1794934212049';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN "image_url"`);
      await queryRunner.query(`ALTER TABLE "${table}" ADD "image_id" uuid`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN "image_id"`);
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD "image_url" character varying`,
      );
    }
  }
}
