import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveWordExternalUrl1794940000000 implements MigrationInterface {
  name = 'RemoveWordExternalUrl1794940000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "words" DROP COLUMN "external_url"');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "words" ADD COLUMN "external_url" character varying',
    );
  }
}
