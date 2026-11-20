# Auth and security

## Protected by default

`ThrottlerGuard`, `JwtAuthGuard` and `RolesGuard` are global, in that order: rate limit, then authenticate, then authorize. So:

| You want…                         | Write                     |
| --------------------------------- | ------------------------- |
| any signed-in user                | nothing (no decorator)    |
| admins (and superadmins)          | `@Roles(Role.ADMIN)`      |
| superadmins only                  | `@Roles(Role.SUPERADMIN)` |
| no authentication (login, health) | `@Public()`               |

Roles are hierarchical (`superadmin` ⊇ `admin` ⊇ `user`), so `@Roles(Role.ADMIN)` already lets superadmins in. Put `@Roles()` on each write route explicitly, even if the controller has one, so a reader sees the rule where the route is.

## Ownership is checked in the service

Roles answer "can this kind of user do this?". Ownership answers "is this their record?". For user-owned data (word answers, progress), always filter by `currentUser.id` in the query, and never take the owner id from the request body.

```ts
this.answersRepository.find({ where: { user: { id: currentUser.id } } });
```

## Sensitive data

- Hash passwords with bcrypt. Never log, return or store them in plain text.
- Mark sensitive entity fields with `@Exclude()` (`passwordHash`), and don't select them in queries that don't need them.
- Never log tokens, passwords or full request bodies of auth routes.
- Auth errors stay vague ("Invalid credentials"), so they don't reveal which emails exist.

## Configuration and secrets

- Read config through `ConfigService`. Every variable is declared and validated in `src/config/env.validation.ts`, so the app fails at startup instead of at first use.
- Add new variables to `.env.example` with a safe placeholder and a comment. Real secrets live only in `.env`, which is never committed.
- `JWT_SECRET` must be long and random outside development.

## HTTP surface

- CORS allows only the origins listed in `CORS_ORIGIN`. Never use `*` together with credentials.
- Rate limits come from `THROTTLE_TTL` / `THROTTLE_LIMIT`. Use `@Throttle()` for stricter limits on sensitive routes (login, register) and `@SkipThrottle()` only with a reason.
- Uploads go through a validation pipe (`ImageFilePipe`) that checks type and size before the file is processed.
- Keep the global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform` in `main.ts`): unknown properties are rejected with 400. Don't disable validation for a route.
