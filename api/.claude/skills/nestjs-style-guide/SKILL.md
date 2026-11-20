---
name: nestjs-style-guide
description: NestJS 11 + TypeORM + PostgreSQL best practices and conventions for the words-app api. Use this whenever you write, change, refactor or explain code in api/ — modules, controllers, DTOs, services, guards, entities, queries, migrations, config or tests — even for a small tweak, and even if the user doesn't mention "best practices". Also use it when the user asks how something "should" be done in NestJS, TypeORM or Postgres, or when another skill (nestjs-review, nestjs-feature) points here.
---

# NestJS style guide

These are the conventions for the API. They follow current NestJS 11, TypeORM 1.x and PostgreSQL practice. The aim is code that is predictable, safe with data, and easy to learn from. When a rule and existing code disagree, follow the rule for new code and mention the mismatch instead of silently rewriting unrelated code.

## Core rules

1. **One feature, one module** under `src/modules/<feature>/` with the same shape: module, controller, service, `entities/`, `dto/`, specs. Modules export services, never repositories.
2. **Controllers are thin.** They map HTTP to a service call: params, body, current user, status code. No queries and no business rules in a controller.
3. **Validate every input at the boundary** with class-validator DTOs and pipes (`ParseUUIDPipe`). Never trust `@Body()` shapes that have no DTO.
4. **Services own business rules and throw Nest HTTP exceptions** (`NotFoundException`, `ConflictException`, `BadRequestException`). Don't return `null` for "not found" from a public method.
5. **Protected by default.** `JwtAuthGuard` and `RolesGuard` are global; opt out with `@Public()`, restrict with `@Roles()`. Hide sensitive fields with `@Exclude()`.
6. **The database enforces invariants.** Uniqueness, foreign keys and NOT NULL live in the schema, not only in service checks. Service checks give nice errors; constraints guarantee correctness.
7. **Schema changes only through hand-written, reversible SQL migrations.** `synchronize` stays `false`. Never edit a migration that has already run.
8. **Multi-step writes run in one transaction** (`repository.manager.transaction`), and every query inside uses that transaction's `manager`.
9. **Queries are parameterized and deterministic.** Use `:param` bindings, never string-concatenated values. Every paginated list has a stable `ORDER BY` ending in a unique column (`id`).
10. **Type everything explicitly.** Function return types are required by lint; functions stay under 30 lines and complexity 10. Split into private helpers instead of disabling rules.

## Topic references

Read only the file that matches the task:

| When you are…                                               | Read                                 |
| ----------------------------------------------------------- | ------------------------------------ |
| adding a module, wiring providers, importing another module | `references/modules-and-di.md`       |
| writing routes, DTOs, validation, response shapes           | `references/controllers-and-dtos.md` |
| writing service logic, errors, transactions                 | `references/services-and-errors.md`  |
| touching auth, roles, secrets, CORS, rate limits, logging   | `references/auth-and-security.md`    |
| writing entities, relations, queries, pagination, indexes   | `references/typeorm-and-postgres.md` |
| changing the schema                                         | `references/migrations.md`           |
| writing or fixing tests                                     | `references/testing.md`              |

## Explaining choices

This is a learning project. When you apply a rule, briefly say which one and why it fits, in prose. Code snippets stay comment-free, because the explanation belongs in the answer. For migrations and other commands with side effects, say what the command changes before running it.
