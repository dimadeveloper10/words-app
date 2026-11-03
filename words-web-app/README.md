# Words web app

Client-rendered React application for learning English words, built with Vite and TypeScript.

## Development

Run these commands from this directory:

```sh
npm install
npm start
```

`npm install` installs dependencies and updates the lockfile. `npm start` starts the development server at http://localhost:5174. Run the NestJS API on port 3000 in a separate terminal; Vite forwards `/api/*` requests to it, stripping `/api` from the path.

`VITE_API_URL` defaults to `/api`. See `.env.example` to override it in a local `.env` file. Vite environment variables are public and must not contain secrets.

## Production build

```sh
npm run build
npm run preview
```

`npm run build` checks TypeScript and generates static assets in `dist/`. `npm run preview` serves that build locally.

`index.html` loads `src/main.tsx`, which mounts React and renders `src/App.tsx`. React Router provides `/login` and `/register` inside a shared auth layout. React Hook Form and Zod validate the fields, then TanStack Query submits them through axios to `/auth/login` or `/auth/register`. Successful authentication redirects to the protected home page at `/`.

Zustand persists the token and user in localStorage under `words-web-app-auth`, separately from the admin panel. Passwords are never persisted. The axios interceptor attaches the Bearer token to API requests and clears invalid sessions on HTTP 401. Restored sessions are verified through `/auth/me`; signing out clears the auth store and query cache. Like the admin panel, this uses a JavaScript-accessible token; a future HttpOnly-cookie flow would require backend changes.

For production hosting, configure an SPA fallback to `index.html` so direct visits to `/login` and `/register` work.

The development proxy is not included in production builds. Configure a production reverse proxy from `/api` to NestJS, or build with an absolute `VITE_API_URL` and allow the web app's origin in the API's `CORS_ORIGIN` setting.

## Formatting

```sh
npm run format
npm run format:check
```

`npm run format` rewrites supported files using Prettier. `npm run format:check` checks formatting without changing files. Generated output, dependencies, and the lockfile are excluded.
