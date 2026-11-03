# Learning Database Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add database storage for exercise types and users' word answers, including answers submitted after offline practice.

**Architecture:** Add two tables through a hand-written, reversible SQL migration. Answers remain the source for future progress queries; no stored progress counters or completion targets. This phase changes the database only, without Nest modules, entities, routes, UI, or scoring logic.

**Tech Stack:** PostgreSQL; the existing TypeORM migration runner.

**Spec:** Agreed requirements and proposed defaults are recorded below from the design discussion.

## Agreed design

- Exercise types have UUID `id`, display `name`, and unique technical `type`.
- Initially support `compile_word` and `choose_translation`.
- A word answer records the user, word, lesson, exercise type, correctness, awarded points, and timestamps.
- Answer IDs are client-generated UUIDs, allowing future synchronization to identify retries. The primary key prevents duplicate rows; retry response handling belongs to the future API.
- Points and correctness are supplied by the client; the database stores them.
- Points belong to the lesson where the answer occurred. Global correct-answer counts use user and word across all lessons and exercise types.
- Targets and learned/completed statuses are interpreted by the UI; store neither thresholds nor status flags.
- Deleting a lesson sets its answer references to NULL and preserves the answers.
- Answers reference words and lessons separately, without a foreign key to `lesson_words`. Removing a word from a lesson must not delete its answers.

## Proposed defaults for this phase

These are implementation recommendations, not additional previously agreed requirements:

- Exercise `type` uses `varchar` with a unique constraint, rather than a PostgreSQL enum. New types can be registered without altering an enum; the clients still need to implement their behavior.
- Display names: `Compile word` and `Choose translation`.
- Awarded points use an integer without a nonnegative check: negative penalties have not been ruled out. No default points or correctness value; writers must supply both explicitly.
- Deleting a user cascades to their answers, keeping personal history scoped to the account.
- Deleting a referenced word or exercise type is restricted, preserving answer history. This means the existing word deletion endpoint can encounter a foreign-key violation once answers exist; API handling or soft deletion is a separate follow-up. Decide this policy before applying the migration; an alternative is deleting answers with words, which loses their historical lesson points.
- Do not add custom lesson ownership or change lesson access in this phase.

## Global Constraints

- Use UUID keys, snake_case SQL column names, named constraints, and raw SQL migrations, following `api/src/database/migrations/`.
- Keep `synchronize: false`; do not modify existing migrations.
- Use the existing local PostgreSQL instance; do not start Docker or install dependencies.
- Do not apply or revert migrations on the working database for verification; use a dedicated disposable test database.
- Do not create commits until an actual WA task number is available. Commit format: `[WA-<number>] Api: <summary>`.

## Review Focus

- Replaying an answer UUID must not create another row or double-count progress.
- Deleting a lesson must retain answers and global correct-answer counts.
- Removing lesson membership must leave historical answers intact.
- Aggregation must combine both exercise types and multiple lessons for a word, while keeping lesson points separate.
- Deleting users, words, and exercise types must follow the explicit foreign-key policy.

## Final schema

### `exercise_types`

| Column | PostgreSQL type | Constraints |
| --- | --- | --- |
| `id` | uuid | Primary key, default `uuid_generate_v4()` |
| `name` | character varying | NOT NULL |
| `type` | character varying | NOT NULL, UNIQUE |

Seed the two initial rows in the migration so they are available immediately after migration. Use generated UUIDs; clients must discover IDs by type through a future API, never hardcode them.

### `word_answers`

| Column | PostgreSQL type | Constraints |
| --- | --- | --- |
| `id` | uuid | Primary key, no default; supplied by client |
| `user_id` | uuid | NOT NULL, FK users(id), ON DELETE CASCADE |
| `word_id` | uuid | NOT NULL, FK words(id), ON DELETE RESTRICT |
| `lesson_id` | uuid | Nullable, FK lessons(id), ON DELETE SET NULL |
| `exercise_type_id` | uuid | NOT NULL, FK exercise_types(id), ON DELETE RESTRICT |
| `is_correct` | boolean | NOT NULL, no default |
| `points_awarded` | integer | NOT NULL, no default |
| `answered_at` | timestamptz | NOT NULL, no default; device answer time |
| `created_at` | timestamptz | NOT NULL, DEFAULT now(); server insertion time |

Use `ON UPDATE NO ACTION` for all foreign keys. No `updated_at`: this phase models answer events without an edit workflow.

Indexes:

- `IDX_word_answers_user_word` on `(user_id, word_id)` for global word counts.
- `IDX_word_answers_user_lesson_exercise` on `(user_id, lesson_id, exercise_type_id)` for exercise and lesson totals.
- Individual indexes on `word_id`, `lesson_id`, and `exercise_type_id` for parent deletion checks and lesson SET NULL updates; the compound indexes do not have these columns as their leading column.

## Task 1: Create and seed the schema

**Files:**
- Create: `api/src/database/migrations/<timestamp>-AddWordAnswer.ts` using a current millisecond timestamp greater than the existing migration timestamps.

**Interfaces:**
- Consumes: existing `users`, `words`, `lessons`, and `uuid_generate_v4()` support.
- Produces: the exact tables, columns, constraints, indexes, and initial rows specified above.

- [x] Confirm the proposed deletion policies before execution, especially their effect on existing word deletion.
- [x] Create `AddWordAnswer<timestamp>` implementing `MigrationInterface`; `up(queryRunner: QueryRunner): Promise<void>` creates exercise types, seeds the two rows, then creates answers, constraints, and indexes.
- [x] Implement `down(queryRunner: QueryRunner): Promise<void>` by dropping `word_answers` before `exercise_types`. Do not use `CASCADE` to conceal unexpected dependencies. Reverting destroys answer data; only use on the disposable test database during verification.
- [x] Run `npm run build` from `api/`; expect a successful TypeScript build.
- [x] Run `npx prettier --check src/database/migrations/<timestamp>-AddWordAnswer.ts` from `api/`; expect no formatting errors.

## Task 2: Verify behavior against PostgreSQL

**Files:**
- Create: `api/test/word-answer.integration-spec.ts`.
- Create: `api/test/jest-db.json`, matching the existing Jest/ts-jest setup but selecting only database integration tests.

**Interfaces:**
- Consumes: the existing migrations and the new migration from Task 1.
- Produces: repeatable verification using `TEST_DB_NAME`, explicitly different from the application's configured database. Reuse connection credentials from the existing environment without printing them.

- [x] Implement a database test harness that fails unless `TEST_DB_NAME` is explicitly set to a database ending in `_test` and differs from the working database. Connect only to a pre-created, empty disposable database; run migrations there and close connections after tests. Do not automatically create/drop databases or reset an occupied database.
- [x] Assert both seeded types exist; duplicate `type`, invalid foreign keys, missing required fields, and duplicate answer IDs are rejected. Verify different answer UUIDs may record repeated attempts for the same word.
- [x] Insert correct answers for the same user and word in two lessons and both exercise types; assert a global correct-answer count of 10, and assert lesson/exercise point sums match only the corresponding rows. Include an incorrect answer and another user's answer to verify isolation and counting.
- [x] Remove a `lesson_words` row and verify its answers remain. Delete a lesson and assert its answers remain with NULL `lesson_id`, unchanged points, and unchanged global correct-answer counts.
- [x] Assert deleting a referenced word or exercise type is rejected; deleting a user deletes that user's answers without affecting another user's answers.
- [x] Check `answered_at` can precede `created_at` and preserves the represented instant for a timestamp with an explicit time-zone offset.
- [x] In the disposable database, revert the new migration, verify only the new tables disappear, then reapply it and verify the seed rows return. Keep this check last, after fixture assertions, because it destroys answer fixtures.
- [x] Run `TEST_DB_NAME=words_app_learning_test npm exec -- jest --config ./test/jest-db.json --runInBand` from `api/`; expect all database tests to pass. `--runInBand` runs tests sequentially against their shared disposable database. If that database is unavailable, report the check as unrun rather than using `words_app`.
- [x] Review `git diff --check` and the final diff; confirm this phase contains only the migration, focused database verification, and planning documentation.

## Deferred work

- TypeORM entities and Nest module registration.
- Authenticated answer submission, validation, duplicate retry handling, ownership checks, and offline batch synchronization.
- Exercise-type discovery and progress endpoints.
- UI completion thresholds, scoring rules, custom lesson ownership, and learned-word presentation.
- Working-database migration rollout after schema review.

## Resulting data flow

A future client generates an answer UUID and records the exercise result locally. A future API authenticates its owner and inserts that event. Database constraints protect references and uniqueness. Future queries sum lesson/exercise points and count correct answers globally per word; the UI applies its targets. This plan provides only the storage foundation for that flow.

## Execution record — 2026-10-28

- User explicitly authorized implementation in the current checkout on `main`.
- Migration: `api/src/database/migrations/1793218406616-AddWordAnswer.ts`.
- Created and subsequently removed the dedicated empty local database `words_app_learning_1793218406616_test` manually for verification; the test harness itself never creates or drops databases. The working database was not migrated.
- RED: before adding the migration, database tests failed because `exercise_types` did not exist.
- GREEN: all 10 PostgreSQL integration tests passed, including schema rollback/reapplication and fixture isolation.
- Build, targeted ESLint, Prettier, and whitespace checks passed.
- Existing unit suite remains at 1 passed / 1 failed: `src/app.controller.spec.ts` expects `Hello World!` while production returns `Hello World`. Observed before implementation and left unchanged.
- Existing user edits in `api/test/app.e2e-spec.ts` were preserved.
- No commits created: no WA task number was provided.
- PostgreSQL returned SQLSTATE `23001` for restricted parent deletion; the test accepts restriction or foreign-key violations and verifies the parent survives.
- Fresh review identified a custom-schema safety gap in the test harness. Added a regression check (observed failing before the fix), rejected existing relations across all non-system schemas, and required the effective schema to be public. Final database suite: 10/10 passed; build, targeted lint, formatting and whitespace checks passed. Disposable database removed after final verification.
