# Services and errors

## Public methods read like the use case

Public methods map to the controller's routes (`findAll`, `findOne`, `create`, `update`, `remove`). Private helpers hold the steps (`findTopic`, `ensureUnique`, `normalizeSlug`). This keeps each function under the lint limits (30 lines, complexity 10) and makes the flow readable top to bottom.

```ts
async findOne(id: string): Promise<Lesson> {
  const lesson = await this.lessonQuery()
    .where('lesson.id = :id', { id })
    .getOne();

  if (!lesson) {
    throw new NotFoundException('Lesson not found');
  }

  return lesson;
}
```

## Errors

| Situation                                                                        | Throw                   |
| -------------------------------------------------------------------------------- | ----------------------- |
| the requested record doesn't exist                                               | `NotFoundException`     |
| a unique value is already taken                                                  | `ConflictException`     |
| the input is valid in shape but not in meaning (unknown related id, wrong state) | `BadRequestException`   |
| the user is authenticated but not allowed                                        | `ForbiddenException`    |
| bad or missing credentials                                                       | `UnauthorizedException` |

- Messages are short, user-facing and leak nothing internal (no SQL, no stack traces, no other users' data).
- A database constraint is the real guarantee. When a race can still hit it, map the Postgres error to an HTTP one instead of letting it become a 500: unique violation `23505` → 409, foreign key violation `23503` → 400 or 404.
- Don't catch an error just to log and re-throw it. Catch only when you change what happens.

## Transactions

Any operation that writes more than one row or table runs in one transaction, and every query inside uses the transaction's `manager`, not the injected repository:

```ts
async create(dto: CreateLessonDto, addedBy: User): Promise<Lesson> {
  const lessonId = await this.lessonsRepository.manager.transaction(
    (manager) => this.insertLesson(manager, dto, addedBy),
  );
  return this.findOne(lessonId);
}
```

- Pass `manager` down to helpers that query inside the transaction (`findTopic(id, manager)`).
- Keep side effects that can't roll back (deleting files, calling other services) outside the transaction, after it commits.
- Re-read the saved entity after the transaction (`findOne`) when the response needs relations or computed columns.

## Replacing a child collection

Replace nested collections (translations, forms, words in a lesson) explicitly inside the transaction: delete the old rows, then insert the new ones. TypeORM's `orphanedRowAction` with cascades can try to set the foreign key to `NULL` on a NOT NULL column and fail.

## Keep services free of HTTP

Services don't know about `Request`, headers or status codes. They take plain arguments (DTOs, ids, the current `User`) and return data or throw exceptions. That's what makes them easy to unit-test.

## Logging

Use `private readonly logger = new Logger(ClassName.name)`. Nest routes it to Pino. Log events that help operate the app (failures of external calls, unexpected states), not every call. Never `console.log` in `src/` (seed scripts are the exception).
