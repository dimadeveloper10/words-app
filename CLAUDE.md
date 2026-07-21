# words-app

An **English → Ukrainian dictionary** application for learning English words. The
repo is split into two independent apps:

- **`api/`** — NestJS backend (REST API, PostgreSQL).
- **`admin/`** — React admin panel for managing words and users.

Roadmap: the admin panel is used to add words and grant roles so users can enrich
entries; later a separate app (web/mobile) will be built for actually learning the
words. The backend may move to microservices in the future.

## Backend (`api/`)

**Stack:** NestJS 11 · TypeORM 1.x · PostgreSQL (`pg`) · JWT (`@nestjs/jwt` +
`passport-jwt`) · `bcrypt` · validation via `class-validator` / `class-transformer`.

**Layout** — feature modules under `src/`, each with the same shape (see `src/users/`
and `src/words/` as templates):

```
src/<feature>/
  <feature>.module.ts       # @Module, TypeOrmModule.forFeature([...])
  <feature>.controller.ts   # @Controller('<feature>'), route handlers
  <feature>.service.ts      # @Injectable, injects Repository<Entity>
  entities/*.entity.ts      # TypeORM entities
  dto/*.dto.ts              # request DTOs with class-validator decorators
```

Cross-cutting code lives in `src/common/` (enums, decorators, guards) and
`src/config/`. Register every new module in `src/app.module.ts`.

**Conventions:**
- UUID primary keys (`@PrimaryGeneratedColumn('uuid')`).
- snake_case DB columns via `@Column({ name: '...' })`; camelCase in TS.
- `@CreateDateColumn`/`@UpdateDateColumn` for timestamps.
- `@Exclude()` (class-transformer) hides sensitive fields — a global
  `ClassSerializerInterceptor` is registered.
- Services throw Nest HTTP exceptions directly (`NotFoundException`,
  `ConflictException`, …).
- Enums (e.g. `Role`, `PartOfSpeech`) live in `src/common/enums/` and map to
  Postgres enum types.

**Auth & roles:** `JwtAuthGuard` + `RolesGuard` are registered globally, so every
route is protected by default.
- `@Public()` opts a route out of authentication.
- `@Roles(Role.ADMIN)` restricts a route; roles are hierarchical
  (`superadmin` ⊇ `admin` ⊇ `user`, see `src/common/enums/role.enum.ts`), so
  `@Roles(Role.ADMIN)` also allows superadmin. No `@Roles()` = any authenticated user.
- `@CurrentUser()` injects the request user.

**Database & migrations:** `synchronize: false` — schema is managed **only** through
migrations in `src/database/migrations/`, hand-written as raw SQL (see
`InitUsers` and `AddWords` for the style). Connection config: `src/database/data-source.ts`.
- `npm run migration:run` — apply migrations (needs a running DB).
- `npm run migration:generate -- src/database/migrations/<timestamp>-<Name>` — generate from entity diff.
- `npm run migration:revert` — roll back the last migration.
- `npm run seed` — idempotently create the superadmin.
- **DB:** use the local PostgreSQL instance (Homebrew) — `.env` points at
  `localhost:5432`, db `words_app`, role `postgres`. Docker (`api/docker-compose.yml`)
  is available but not used.

**Run:** `npm run start:dev`. **Tests:** `npm test` (unit), `npm run test:e2e`.

### Domain: words

A dictionary entry is three normalized tables:
- **`words`** — `word` (unique), `transcription`, `image_url`.
- **`word_translations`** (flat) — `part_of_speech` (enum), `text`, `is_primary`
  (a word may have several primary translations), `sort_order`. Grouping by part of
  speech is done in the response/UI, not in the schema.
- **`word_forms`** — additional inflected forms (`did`, `done`, `men`, …): just
  `form` + `sort_order`.

API (`/words`): `GET` for any authenticated user; `POST`/`PATCH`/`DELETE` require
`@Roles(Role.ADMIN)`. Create/update accept the word with nested `translations` and
`forms` in one payload; `update` replaces a collection wholesale when it is provided
(orphan rows are deleted); deleting a word cascades to its children.

## Admin panel (`admin/`)

**Stack:** React 19 · Vite 6 · TypeScript · react-router-dom 7 · TanStack Query 5
(server state) · Zustand 5 + `persist` (auth state) · axios · react-hook-form + zod ·
shadcn/ui (Radix + lucide-react + sonner) · Tailwind CSS v4.

**Layout** — feature-based under `src/features/<feature>/` (see `features/users/`):
`*Page.tsx` (view), `*.api.ts` (axios calls returning typed data), `use*.ts`
(React Query hooks), optional `*.schemas.ts` (zod), small sub-components.
Shared: `lib/api.ts` (axios instance + JWT interceptor + `getApiErrorMessage`),
`stores/auth.ts`, `types/`, `components/ui/` (shadcn primitives).

Add a page: create `src/features/<feature>/`, register the route under `AppLayout`
in `router.tsx`, and add a `NavLink` in `components/AppLayout.tsx`.

**Run:** `npm run dev` (port 5173). API base URL from `VITE_API_URL` (`.env`).
