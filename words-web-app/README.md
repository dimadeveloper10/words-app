# Words web app

Client-rendered React application for learning English words, built with Vite and TypeScript.

## Development

Run these commands from this directory:

```sh
npm install
npm run dev
```

`npm install` installs dependencies and updates the lockfile. `npm run dev` starts the development server at http://localhost:5174.

## Production build

```sh
npm run build
npm run preview
```

`npm run build` checks TypeScript and generates static assets in `dist/`. `npm run preview` serves that build locally.

`index.html` loads `src/main.tsx`, which mounts React and renders `src/App.tsx`. The app currently renders a blank page and makes no API requests.

## Formatting

```sh
npm run format
npm run format:check
```

`npm run format` rewrites supported files using Prettier. `npm run format:check` checks formatting without changing files. Generated output, dependencies, and the lockfile are excluded.
