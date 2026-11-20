---
name: nestjs-review
description: Review NestJS/TypeORM/PostgreSQL changes in the words-app api against the nestjs-style-guide and report findings without editing code. Use this whenever the user asks to review, check, audit or critique API code, a module, a migration, an entity, a query, a diff, a commit or a branch in api/ ("review my changes", "is this migration safe?", "check the last commit", "anything wrong with this service?"), even if they don't say "style guide".
---

# NestJS review

Review API changes for correctness, data safety and adherence to the `nestjs-style-guide` skill, and explain each finding so the user learns the underlying rule. This skill reports; it doesn't change code unless the user asks for fixes afterwards.

## 1. Collect the changes

Pick the target from the request:

| Request                             | Command                            |
| ----------------------------------- | ---------------------------------- |
| nothing specific (uncommitted work) | `git diff` and `git diff --staged` |
| "last commit" / a commit hash       | `git show <hash>`                  |
| a branch                            | `git diff main...<branch>`         |
| specific files or the whole API     | read those files                   |

Limit the diff to `api/` (append `-- api` to git commands). If there are no changes, say so and stop.

Read the surrounding code of each changed hunk: the entity behind a query, the migration behind an entity change, the DTO behind a controller. Many backend bugs only show up across those files.

## 2. Check against the guide

Load the `nestjs-style-guide` skill. Then read only the reference files that match what changed:

- modules, providers, imports → `modules-and-di.md`
- controllers, routes, DTOs → `controllers-and-dtos.md`
- services, errors, transactions → `services-and-errors.md`
- guards, roles, config, secrets, logging → `auth-and-security.md`
- entities, queries, pagination, indexes → `typeorm-and-postgres.md`
- files in `src/database/migrations/` → `migrations.md`
- specs, or logic without tests → `testing.md`

Look hardest at the bugs the guide exists to prevent:

- a write route without `@Roles()`, a new `@Public()`, or user-owned data not filtered by the current user;
- request input without a DTO or validators, or a DTO accepting fields the client must not set;
- an entity change without a matching migration, or a migration whose `down()` doesn't reverse `up()`;
- an edited migration that has already run;
- a NOT NULL column added to existing data without a default or backfill;
- multi-step writes outside a transaction, or queries inside a transaction that don't use its `manager`;
- SQL built from interpolated input;
- N+1 queries, missing FK indexes, unstable pagination order;
- uniqueness enforced only in code, or unmapped constraint errors turning into 500s;
- passwords, tokens or `@Exclude()`-worthy fields leaking into responses or logs.

## 3. Run the automated checks

From `api/`:

- `npm run lint:check`
- `npm test`
- `npm run build`

Use `lint:check`, not `lint`, because `lint` runs `--fix` and rewrites files. Don't run migrations or DB tests as part of a review. Include the results; when they fail, tie each error back to a finding.

## 4. Report

Use this structure:

```
## API review: <target>

### 🔴 Bugs
- `path/file.ts:42`: <what is wrong> → <concrete fix>
  _Rule:_ <guide rule> (<reference file>). <one sentence on why it matters>

### 🟡 Guideline issues
- …

### 💡 Suggestions
- …

### Checks
| Check | Result |
|---|---|
| lint:check | ✅ / ❌ … |
| test | ✅ / ❌ … |
| build | ✅ / ❌ … |
```

- Omit empty sections, and say plainly when there are no findings.
- Severity: 🔴 is wrong behaviour, a security hole or a risk to data; 🟡 breaks a guide rule without a current bug; 💡 is optional polish.
- Keep each finding to a few lines. Show a short code excerpt only when the fix isn't obvious from the description.
- Don't report formatting (Prettier owns that) or rules that lint already reported, other than linking them to findings.
- End by offering to apply the fixes. Don't apply them unprompted.
