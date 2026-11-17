import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignJunctionIndexes1794945593815 implements MigrationInterface {
  name = 'AlignJunctionIndexes1794945593815';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_topic_words_topic_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_lesson_words_word_id"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_d9973578263ec30e3d5de447fd" ON "topic_words"  ("word_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_439b8f7f45cbf3b0832f202c7a" ON "topic_words"  ("topic_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_45151ebfb7d6225d910b55deb2" ON "lesson_words"  ("lesson_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ab266388121f17435b5448312e" ON "lesson_words"  ("word_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ab266388121f17435b5448312e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_45151ebfb7d6225d910b55deb2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_439b8f7f45cbf3b0832f202c7a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d9973578263ec30e3d5de447fd"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_lesson_words_word_id" ON "lesson_words" USING btree ("word_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_topic_words_topic_id" ON "topic_words" USING btree ("topic_id") `,
    );
  }
}
