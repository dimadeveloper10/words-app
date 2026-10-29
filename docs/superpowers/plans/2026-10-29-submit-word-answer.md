# Submit Word Answer

## Agreed design

Implement only `POST /word-answers`, one completed attempt per request.
The UI supplies correctness and awarded points; the API stores both unchanged.
The authenticated JWT determines ownership. No caller-supplied user ID.
The client supplies a stable UUID so retries do not duplicate attempts.

Request fields: `id`, `wordId`, optional/nullable `lessonId`, `exerciseType`,
`isCorrect`, `pointsAwarded`, `startedAt`, and `answeredAt`.
Dates must be ISO 8601 strings with seconds, a timezone, and at most millisecond
precision; start must not follow answer time.
Points must be a signed PostgreSQL integer. No scoring rules are imposed.

The UI supplies the stable exercise `type` (for example `compile_word`), which
the API resolves to an internal UUID for storage. Answer responses expose
`exerciseType` as that same string. `GET /exercise-types` returns `{ type, name }`
objects without database IDs or pagination. Unknown exercise types return 404.
This API change requires no database migration; `type` is already unique.

Return a flat answer with the submitted fields (lesson normalized to null) and
server `createdAt`. New submissions return 201; identical retries return 200.
Reusing a UUID with different content or another user returns 409.
UUIDs are compared in canonical lowercase and dates by their instant.
Validate word/exercise/lesson existence and word membership for a new lesson answer.
Check retries before current membership: removing a word from a lesson must not
invalidate an already recorded attempt. Deleting the lesson clears its stored
reference, so a retry with that original lesson ID returns 409.

Use the existing Nest DTO/controller/service/module structure and TypeORM
repositories. Insert new answers rather than using save/upsert, which could
overwrite history. The database primary key handles concurrent duplicate inserts;
on a duplicate, reload and compare the persisted answer.

## Implementation plan

- [x] Add validated create DTO and flat response DTO.
- [x] Add service with reference validation, immutable insert, safe retry comparison,
      and HTTP exceptions for known database constraint failures.
- [x] Add authenticated controller, return 201/200 as appropriate, register module.
- [x] Verify build, lint changed files, run existing unit tests, review diff.

Verification: Nest build passed; targeted ESLint passed; existing unit suite passed
(2 suites, 2 tests). Read-only review found no important/critical issues; timestamp
validation was tightened following its precision finding. No endpoint runtime
or integration tests were added or run.

User explicitly requested no new tests for this change. Preserve the earlier
started_at entity/migration/integration-test changes. No commits requested.
Work continues on local branch `api/submit-word-answer`, keeping those existing
uncommitted changes available; no separate worktree is created.
