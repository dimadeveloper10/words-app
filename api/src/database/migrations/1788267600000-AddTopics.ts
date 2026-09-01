import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTopics1788267600000 implements MigrationInterface {
  name = 'AddTopics1788267600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "topics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" character varying, "sort_order" integer NOT NULL DEFAULT 0, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_topics_name" UNIQUE ("name"), CONSTRAINT "UQ_topics_slug" UNIQUE ("slug"), CONSTRAINT "PK_topics" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "topics"`);
  }
}
