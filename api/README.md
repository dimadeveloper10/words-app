# Words API

NestJS REST API for the words-app: authentication and roles, the English →
Ukrainian dictionary, topics and lessons, uploaded images, and learners' exercise
answers. Data lives in PostgreSQL through TypeORM.

## Development

Requirements: Node.js 24 and PostgreSQL. Run these commands from this directory:

```sh
npm install
cp .env.example .env
npm run migration:run
npm run seed
npm run start:dev
```

- `npm run migration:run` creates or updates the schema in the database configured
  in `.env`.
- `npm run seed` creates the first superadmin from `SUPERADMIN_EMAIL` /
  `SUPERADMIN_PASSWORD`. It's idempotent and can be run again safely.
- `npm run start:dev` starts the API at http://localhost:3000 and restarts on changes.

No local PostgreSQL? `docker compose up -d` starts PostgreSQL 16 using the `DB_*`
values from `.env`.

Interactive API docs (Swagger) are served at http://localhost:3000/docs, and the
OpenAPI JSON at `/docs-json`. Sign in through `POST /auth/login`, then paste the
`accessToken` into **Authorize**.

## Environment variables

| Variable                                                      | Description                                                        |
| ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `NODE_ENV`, `PORT`                                            | runtime mode and HTTP port (default `3000`)                        |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | PostgreSQL connection                                              |
| `JWT_SECRET`, `JWT_EXPIRES_IN`                                | signing secret and lifetime of access tokens                       |
| `CORS_ORIGIN`                                                 | comma-separated allowed origins (admin panel and web app)          |
| `REDIS_URL`                                                   | Redis used to cache dictionary transcription lookups               |
| `THROTTLE_TTL`, `THROTTLE_LIMIT`                              | rate limit window (ms) and requests per window per client IP       |
| `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`                     | first superadmin created by `npm run seed`                         |
| `LOG_LEVEL`                                                   | `fatal` · `error` · `warn` · `info` · `debug` · `trace` · `silent` |

All variables are validated at startup in `src/config/env.validation.ts`. See
`.env.example` for defaults. Never commit `.env`.

## Commands

| Command                                                                    | What it does                             |
| -------------------------------------------------------------------------- | ---------------------------------------- |
| `npm run start:dev`                                                        | start in watch mode                      |
| `npm run build`                                                            | compile to `dist/`                       |
| `npm run start:prod`                                                       | run the compiled build                   |
| `npm run lint`                                                             | lint and auto-fix                        |
| `npm run lint:check`                                                       | lint without changing files (used by CI) |
| `npm test`                                                                 | unit tests (no database needed)          |
| `npm run test:e2e`                                                         | end-to-end tests                         |
| `npm run migration:run`                                                    | apply pending migrations                 |
| `npm run migration:revert`                                                 | roll back the last applied migration     |
| `npm run migration:generate -- src/database/migrations/<timestamp>-<Name>` | draft a migration from entity changes    |
| `npm run seed`                                                             | create the first superadmin              |

`migration:run` and `migration:revert` change the database in `.env`.

## API overview

| Resource          | Routes                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| `/auth`           | register, login, current user (`/auth/me`)                                                            |
| `/users`          | list users (admin); create users and change roles (superadmin)                                        |
| `/words`          | paginated search; create, update, delete (single or bulk) words with translations, forms and examples |
| `/topics`         | topics and their words                                                                                |
| `/lessons`        | lessons in a topic and their words                                                                    |
| `/images`         | image upload; files are served from `/static/images/`                                                 |
| `/dictionary`     | transcription lookup through an external dictionary API                                               |
| `/exercise-types` | available exercise types                                                                              |
| `/word-answers`   | the current user's exercise answers, including batch sync                                             |

Every route requires a JWT except `POST /auth/register` and `POST /auth/login`.
Content changes, image uploads and dictionary lookups require the `admin` role;
creating users and changing roles require `superadmin`. Requests are rate-limited
per client IP, with stricter limits on the auth routes.

## Project structure

```text
src/
  modules/<feature>/   feature modules: controller, service, entities, DTOs, specs
  common/              shared decorators, DTOs, enums, guards, pipes
  config/              env validation, logger and throttler setup
  database/            data source, migrations, seeds
static/                uploaded files (not committed)
test/                  e2e and database integration tests
```

The schema is managed only through hand-written SQL migrations in
`src/database/migrations/` (`synchronize` is off).
