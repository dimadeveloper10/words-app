---
name: react-feature
description: Scaffold a new feature or page in words-web-app (feature folder, page component + CSS, types, API module, data hook, route registration) following the react-style-guide. Use this whenever the user wants to add a new page, screen, route, section or feature to the web app ("add a statistics page", "I need a settings screen", "create a new exercise type page"), even if they don't say "scaffold".
---

# New feature in words-web-app

Create a new feature in the app's existing structure, written to the `react-style-guide`. Load that skill first, and read `references/components.md`, `references/typescript.md` and `references/styling.md` (plus `references/hooks-and-state.md` if the feature loads data).

## 1. Clarify

Settle these before writing anything. Ask only about what the request doesn't already answer:

- **Feature name**, in kebab-case for the folder (`statistics`) and PascalCase for components (`StatisticsPage`).
- **Route path** and whether it has params (`/lessons/:lessonId/stats`).
- **Placement:** inside the main app shell (`AppLayout`, with header and navigation) or full-screen, like the exercise pages.
- **Data:** none, existing data from the app's stores or hooks, or a new API endpoint.

Check `src/features/` for an existing feature that already owns this data. Extending it is often better than creating a new folder.

## 2. Plan and wait

Show the files you'll create and the change to the router, with a sentence each on its purpose, then wait for the user's OK. The user wants to review plans before code is written.

## 3. Create the files

Follow the existing layout in `src/features/<feature>/`, and create only what the feature needs:

| File                    | When                              | Contents                                                                                    |
| ----------------------- | --------------------------------- | ------------------------------------------------------------------------------------------- |
| `<Name>Page.tsx`        | always                            | the page component, returning `JSX.Element`                                                 |
| `<Name>Page.css`        | always                            | styles, block-prefixed class names, imported by the page                                    |
| `components/<Part>.tsx` | when the page has distinct pieces | sub-components, one per file                                                                |
| `<feature>.types.ts`    | new domain data                   | interfaces for the data                                                                     |
| `<feature>.api.ts`      | new endpoint                      | functions that call the shared axios instance in `src/lib/api.ts` and return typed promises |
| `use<Feature>.ts`       | data loading or non-trivial logic | a hook that returns a named type                                                            |

Before writing, look at one similar existing feature (for example `src/features/lessons/`) and match its import style, its data access (store selectors versus TanStack Query), and its file naming. New code should look like it belongs.

## 4. Register the route

Add the route in `src/router.tsx`:

- in-app pages go in the `AppLayout` children, next to `/topics` and `/lessons`;
- full-screen pages go next to the exercise routes, inside `CatalogLoader` but outside `AppLayout`;
- both stay inside `RequireAuth` unless the page is public, like login.

If the page should appear in navigation, add the link where the existing links live (check `src/components/AppHeader.tsx`).

## 5. Verify

From `words-web-app/`:

- `npm run lint`
- `npx tsc --noEmit`

Don't use `tsc -b`, because it writes a build-info file into the repo. Fix any errors, then summarize what was created and how a visit to the route flows through the router, the page, the hook and the API. This is a learning project, so explain that data flow briefly. Don't commit; the user commits separately.
