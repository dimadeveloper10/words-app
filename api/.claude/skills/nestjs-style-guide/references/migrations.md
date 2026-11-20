# Migrations

`synchronize` is `false`. The schema changes **only** through migrations in `src/database/migrations/`, written as raw SQL with `queryRunner.query()`.

## Shape

```ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTopicImage1793300000000 implements MigrationInterface {
  name = 'AddTopicImage1793300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "topics" ADD "image_id" uuid`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "topics" DROP COLUMN "image_id"`);
  }
}
```

- File name `<timestamp>-<PascalCaseName>.ts`; the class name is `<Name><timestamp>` and `name` matches it. The timestamp must be later than every existing migration.
- `down()` exactly reverses `up()`, in reverse order. Test it with `npm run migration:revert` followed by `npm run migration:run`.
- Name every constraint and index explicitly, matching the entity (`FK_lessons_topic`, `UQ_lessons_topic_slug`, `IDX_lesson_words_word_id`).
- `npm run migration:generate -- src/database/migrations/<timestamp>-<Name>` can draft the SQL from the entity diff. Always read and clean it up: rename auto-generated constraint names, remove unrelated changes, check `down()`.

## Rules

1. **Never edit a migration that has run** anywhere (your DB, CI, a teammate's). Add a new one instead.
2. **Entity and migration change together** in the same commit, and must describe the same schema.
3. **One concern per migration.** Smaller migrations are easier to review and revert.
4. **No application code in migrations** (no entity imports, no services). Use SQL only, so old migrations keep working when the code changes.

## Safe changes on existing data

| Change                  | Safe way                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| add a NOT NULL column   | add it nullable → backfill with `UPDATE` → `SET NOT NULL`; or add with a `DEFAULT`         |
| rename a column         | `RENAME COLUMN` in one migration, and update the entity `name` together                    |
| change a column type    | `ALTER COLUMN … TYPE … USING …` with an explicit conversion                                |
| add a value to an enum  | `ALTER TYPE … ADD VALUE '…'`. Removing a value needs a new type, so plan `down()`          |
| add a unique constraint | first check for or clean up duplicates in the same migration                               |
| drop a column or table  | make sure no code reads it any more; `down()` can only restore the structure, not the data |

- Write backfills as set-based SQL (`UPDATE … SET … WHERE …`), not row by row.
- For big tables, `CREATE INDEX CONCURRENTLY` avoids locking writes, but it can't run inside a transaction (set `transaction = false` on that migration).

## Commands

| Command                                | What it does                                                  |
| -------------------------------------- | ------------------------------------------------------------- |
| `npm run migration:run`                | applies all pending migrations to the database in `.env`      |
| `npm run migration:revert`             | rolls back the **last** applied migration (runs its `down()`) |
| `npm run migration:generate -- <path>` | writes a draft migration from the entity diff                 |

`run` and `revert` change the database. Say so before running them, and never run them against a non-local database without the user's explicit OK.
