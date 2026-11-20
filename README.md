# words-app

English → Ukrainian dictionary application for learning English words.

## Applications

| App                                         | Description                                    | Stack                       | Local URL               |
| ------------------------------------------- | ---------------------------------------------- | --------------------------- | ----------------------- |
| [`api/`](api/README.md)                     | REST API                                       | NestJS, TypeORM, PostgreSQL | `http://localhost:3000` |
| [`admin/`](admin/README.md)                 | Admin panel for dictionary content and users   | React, Vite, Tailwind CSS   | `http://localhost:5173` |
| [`words-web-app/`](words-web-app/README.md) | Learner app: topics, lessons, words, exercises | React, Vite                 | `http://localhost:5174` |

Each application is an independent npm project with its own `package.json`,
setup, and commands. The repository root only holds the shared Git hooks.

## How the apps fit together

```text
admin panel ──┐
              ├──► API ──► PostgreSQL
web app ──────┘
```

- **API** is the single source of data and rules: authentication, roles, the
  dictionary, topics, lessons, and learners' answers.
- **Admin panel** is for editors: admins fill the dictionary and organize words
  into topics and lessons, and superadmins manage users and roles.
- **Web app** is for learners: they browse topics and lessons, study word cards
  with images and pronunciation, and practise with exercises such as "Compile
  word". The catalog is cached on the device, so the app keeps working offline,
  and exercise answers sync to the API once the connection is back.

## Getting started

Start the API first, then the client you need. Follow the README of each
application for installation, environment variables, and commands.

## Quality checks

- **Pre-commit:** Husky runs lint-staged (ESLint + Prettier) on staged files.
- **CI:** GitHub Actions workflows live in `.github/workflows/`.

## Domain

```text
Topic
└── Lessons
    └── Words
        ├── translations
        ├── forms
        └── examples

User
└── WordAnswers
```

## Roadmap

- More exercise types in the learner app
- Learning progress and statistics
- Possible move of the backend to microservices
