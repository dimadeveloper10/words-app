# Words admin panel

React admin panel for managing dictionary content (words, topics, lessons) and
users, built with Vite, TypeScript, Tailwind CSS, and shadcn/ui.

## Development

Run these commands from this directory:

```sh
npm install
cp .env.example .env
npm run start
```

`npm run start` starts the development server at http://localhost:5173. The NestJS
API must be running and must allow this origin in its `CORS_ORIGIN` setting.

## Environment variables

| Variable       | Description                | Default in `.env.example` |
| -------------- | -------------------------- | ------------------------- |
| `VITE_API_URL` | Base URL of the NestJS API | `http://localhost:3000`   |

Vite environment variables are public and must not contain secrets.

## Commands

```sh
npm run start
npm run build
npm run preview
npm run lint
npm run format
npm run format:check
```

`npm run build` checks TypeScript and generates static assets in `dist/`, and
`npm run preview` serves that build locally. `npm run format` rewrites files with
Prettier, and `npm run format:check` only checks them.

## Pages

| Route                      | Purpose                            |
| -------------------------- | ---------------------------------- |
| `/login`, `/register`      | Authentication                     |
| `/words`                   | Search, create, edit, delete words |
| `/topics`, `/topics/:id`   | Topics and the words they contain  |
| `/lessons`, `/lessons/:id` | Lessons and the words they contain |
| `/users`                   | Users and their roles              |

Write operations require the `admin` role, and role management requires
`superadmin`, as enforced by the API.

## Authentication

Zustand persists the token and user in localStorage under `words-admin-auth`,
separately from the learner web app. The axios instance in `src/lib/api.ts`
attaches the Bearer token to every request and clears the session on HTTP 401.

For production hosting, configure an SPA fallback to `index.html` so direct visits
to nested routes work.
