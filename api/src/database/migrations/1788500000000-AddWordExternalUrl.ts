import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWordExternalUrl1788500000000 implements MigrationInterface {
  name = 'AddWordExternalUrl1788500000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "words" ADD COLUMN "external_url" character varying',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "words" DROP COLUMN "external_url"');
  }
}
