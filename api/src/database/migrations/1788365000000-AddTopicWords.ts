import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTopicWords1788365000000 implements MigrationInterface {
  name = 'AddTopicWords1788365000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "topic_words" ("word_id" uuid NOT NULL, "topic_id" uuid NOT NULL, CONSTRAINT "PK_topic_words" PRIMARY KEY ("word_id", "topic_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_topic_words_topic_id" ON "topic_words" ("topic_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "topic_words" ADD CONSTRAINT "FK_topic_words_word" FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "topic_words" ADD CONSTRAINT "FK_topic_words_topic" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "topic_words" DROP CONSTRAINT "FK_topic_words_topic"`,
    );
    await queryRunner.query(
      `ALTER TABLE "topic_words" DROP CONSTRAINT "FK_topic_words_word"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_topic_words_topic_id"`);
    await queryRunner.query(`DROP TABLE "topic_words"`);
  }
}
