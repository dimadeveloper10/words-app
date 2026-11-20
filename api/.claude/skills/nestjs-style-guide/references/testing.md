# Testing

## Kinds of tests here

| Kind        | Where                                     | Command                                 | Needs a DB |
| ----------- | ----------------------------------------- | --------------------------------------- | ---------- |
| unit        | `src/**/<name>.spec.ts`, next to the code | `npm test`                              | no         |
| e2e         | `test/*.e2e-spec.ts`                      | `npm run test:e2e`                      | yes        |
| integration | `test/word-answer.integration-spec.ts`    | `npx jest --config ./test/jest-db.json` | yes        |

CI runs lint, unit tests and the build. Keep `npm test` fast and DB-free.

The integration spec refuses to run unless `TEST_DB_NAME` ends in `_test`, differs from `DB_NAME`, and points at an empty database. Keep that safety check in any new DB test.

## What to unit-test

Test service behaviour, not framework wiring:

- the happy path returns the right data and calls the repository with the right arguments;
- each thrown exception (`NotFoundException`, `ConflictException`, …);
- branching rules (PATCH: omitted vs `null` vs value, replacing collections);
- mapping of Postgres errors (`23505`, `23503`).

Controllers that only delegate don't need their own tests.

## Pattern: construct the service with fake repositories

```ts
function setup(lesson: Lesson | null): Context {
  const lessonsRepo = { findOne: jest.fn().mockResolvedValue(lesson) };
  const service = new LessonsService(
    lessonsRepo as unknown as Repository<Lesson>,
    {} as Repository<Topic>,
    {} as Repository<Word>,
    {} as ImagesService,
  );
  return { service, lessonsRepo };
}

it('throws when the lesson does not exist', async () => {
  const { service } = setup(null);

  await expect(service.update('lesson-id', {})).rejects.toBeInstanceOf(
    NotFoundException,
  );
});
```

- Put the setup in a `setup()` function that returns a typed context, instead of shared mutable `let` variables in `beforeEach`.
- Mock only the methods the test touches. For transactions, fake `manager.transaction` as `(work) => work(fakeManager)`.
- One behaviour per `it`, named as a sentence ("throws when …", "replaces the words when wordIds is given").
- Assert on outcomes (return values, thrown errors, the arguments that matter), not on every internal call.

## e2e and integration tests

- Use them for what mocks can't prove: guards and roles on real routes, validation responses, SQL that depends on constraints or ordering.
- Point them at a separate test database, never at your development data. Each test creates the data it needs and doesn't depend on test order.

## Before calling work done

From `api/`: `npm run lint:check`, `npm test` and `npm run build`. Report failures with their output instead of skipping them.
