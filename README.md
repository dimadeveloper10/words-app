# words-app

English → Ukrainian dictionary application.

## Applications

```text
words-app/
├── api/       NestJS REST API
└── admin/     React admin panel
```

## Stack

**API:** NestJS 11, TypeScript, TypeORM, PostgreSQL, JWT, Passport, bcrypt,
class-validator.

**Admin:** React 19, Vite, TypeScript, React Router, TanStack Query, Zustand,
React Hook Form, Zod, Tailwind CSS, shadcn/ui.

## Features

- Registration and JWT authentication
- `user`, `admin`, and `superadmin` roles
- User and role management
- Paginated word search
- Ukrainian translations grouped by part of speech
- Word forms, examples, and images
- Admin panel for users and dictionary entries

## Setup

### API

```bash
cd api
npm install
cp .env.example .env
npm run migration:run
npm run seed
npm run start:dev
```

API environment variables:

```text
NODE_ENV
PORT
DB_HOST
DB_PORT
DB_USERNAME
DB_PASSWORD
DB_NAME
JWT_SECRET
JWT_EXPIRES_IN
CORS_ORIGIN
SUPERADMIN_EMAIL
SUPERADMIN_PASSWORD
```

### Admin

```bash
cd admin
npm install
cp .env.example .env
npm run start
```

Admin environment variables:

```text
VITE_API_URL
```

Default local URLs:

- API: `http://localhost:3000`
- Admin: `http://localhost:5173`

## Commands

### API

```bash
npm run start:dev
npm run build
npm run lint
npm test
npm run test:e2e
npm run migration:run
npm run migration:revert
npm run seed
```

### Admin

```bash
npm run start
npm run build
npm run lint
```

## Domain

```text
Word
├── translations
├── forms
└── examples
```

## Roadmap

```text
Topic
└── Lessons
    └── Words
```
