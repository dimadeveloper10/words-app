import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWordExamples1784749296799 implements MigrationInterface {
  name = 'AddWordExamples1784749296799';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "word_examples" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "word_id" uuid NOT NULL, "text" character varying NOT NULL, "translation" character varying, "sort_order" integer NOT NULL DEFAULT 0, CONSTRAINT "PK_word_examples" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "word_examples" ADD CONSTRAINT "FK_word_examples_word" FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "word_examples" DROP CONSTRAINT "FK_word_examples_word"`,
    );
    await queryRunner.query(`DROP TABLE "word_examples"`);
  }
}
