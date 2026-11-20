---
name: nestjs-feature
description: Scaffold a new feature, resource or endpoint in the words-app api (NestJS module, TypeORM entity, SQL migration, DTOs, service, controller, unit tests, AppModule registration) following the nestjs-style-guide. Use this whenever the user wants to add a new resource, table, endpoint, module or domain concept to the API ("add a statistics endpoint", "I need a progress table", "create a CRUD for examples"), even if they don't say "scaffold".
---

# New feature in the api

Create a new feature in the API's existing structure, written to the `nestjs-style-guide`. Load that skill first, and read `references/modules-and-di.md`, `references/controllers-and-dtos.md` and `references/services-and-errors.md`. If the feature adds or changes tables, also read `references/typeorm-and-postgres.md` and `references/migrations.md`.

## 1. Clarify

Settle these before writing anything. Ask only about what the request doesn't already answer:

- **Resource name**: kebab-case plural for the folder and route (`word-answers`), PascalCase singular for the entity (`WordAnswer`), snake_case plural for the table (`word_answers`).
- **Data**: columns, types, nullability, uniqueness, and relations to existing entities (with `onDelete` behaviour).
- **Routes**: which operations, and who may call each one (any user, `admin`, `superadmin`, public). Is the data owned by a user?
- **Lists**: pagination, filters and the sort order.

Check `src/modules/` for an existing module that already owns this data. Extending it is often better than creating a new one.

## 2. Plan and wait

Show the files you'll create or change, the table schema (columns, constraints, indexes) and the routes with their roles, with a sentence each on its purpose. Then wait for the user's OK. The user wants to review plans before code is written.

## 3. Create the files

Follow the layout of an existing module (for example `src/modules/lessons/`) and match its import style, naming and patterns. Create only what the feature needs:

| File                                                   | Contents                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `entities/<name>.entity.ts`                            | entity with UUID id, snake_case columns, named constraints, timestamps         |
| `src/database/migrations/<ts>-<Name>.ts`               | hand-written SQL `up()` and an exact reverse `down()`, with FK indexes         |
| `dto/create-<name>.dto.ts`, `dto/update-<name>.dto.ts` | validated inputs; the update DTO has only optional fields                      |
| `dto/query-<names>.dto.ts`                             | filters, extending `PaginationQueryDto` (only for lists)                       |
| `<names>.service.ts`                                   | business rules, `NotFoundException` / `ConflictException`, transactions        |
| `<names>.controller.ts`                                | thin routes with `ParseUUIDPipe`, `@Roles()` and explicit return types         |
| `<names>.module.ts`                                    | `TypeOrmModule.forFeature([...])`, controller, service, exports only if needed |
| `<names>.service.spec.ts`                              | unit tests for the service's rules and errors                                  |

Then register the module in `src/app.module.ts`, next to the other feature modules. If the feature needs a new environment variable, add it to `src/config/env.validation.ts` and `.env.example`.

## 4. Verify

From `api/`:

- `npm run lint:check`
- `npm test`
- `npm run build`

Fix any errors. Applying the migration (`npm run migration:run`) changes the local database, so explain that and ask before running it; if the user agrees, also check `npm run migration:revert` and run it again to prove `down()` works.

Summarize what was created and how a request flows: guard → validation pipe → controller → service → repository → Postgres → serializer. This is a learning project, so explain that flow and the schema choices briefly. Don't commit; the user commits separately.
