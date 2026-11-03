# Client catalog store (web app) — design

Date: 2026-11-03
App: `words-web-app/`

## Goal

Load topics and lessons **once** after the user logs in, keep them in a client-side
Zustand store, and let every page read them through selectors — no further requests
while browsing.

This is the first step towards an offline-capable app: the store is a local copy of
server data. Later steps (out of scope here) persist it to IndexedDB, add user answers
stored locally and synced to the API, and compute lesson points with selectors.

## Decisions

- **Freshness:** never refetch during a session. Data reloads only after a full page
  reload or a new login. Server changes made mid-session are not shown until then.
- **Tool:** Zustand, not TanStack Query, because the client will own data (answers),
  work offline, and derive values across several collections (answers × lessons).
  TanStack Query stays for `auth/me`.
- **Persistence:** in-memory only for now; the state shape must allow adding
  `persist` with an IndexedDB storage later without changing pages or selectors.

## 1. Store — `src/stores/catalog.ts`

```ts
interface CatalogState {
  topics: Topic[];
  lessons: Lesson[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: unknown;
  load: () => Promise<void>;
  reset: () => void;
}
```

- `load()` fetches topics and lessons in parallel with the existing `getAllTopics()`
  and `getAllLessons()` (`Promise.all`). It returns immediately when `status` is
  `loading` or `ready` (guards StrictMode's double effect in development). On failure
  it sets `status: 'error'` and `error`; calling it again retries.
- `reset()` returns to `{ topics: [], lessons: [], status: 'idle', error: null }`.
- Data fields are plain JSON so a later
  `persist(..., { partialize: (s) => ({ topics: s.topics, lessons: s.lessons }) })`
  is a drop-in change.

## 2. Selectors

Pure functions in `src/stores/catalog.selectors.ts`:

| Selector | Returns |
|---|---|
| `selectTopics(state)` | `Topic[]` |
| `selectTopic(state, id)` | `Topic \| undefined` |
| `selectLessons(state)` | `Lesson[]` |
| `selectTopicLessons(state, topicId)` | `Lesson[]` (new array) |
| `selectLesson(state, id)` | `Lesson \| undefined` |

Hooks wrap them, one line each:

- `features/topics/useTopics.ts`: `useTopics()`, `useTopic(id)`
- `features/lessons/useLessons.ts`: `useLessons()`, `useTopicLessons(topicId)`,
  `useLesson(id)`

`useTopicLessons` wraps its selector in `useShallow` (from `zustand/react/shallow`)
because `.filter()` returns a new array on every call; without it Zustand 5 enters an
infinite render loop. The other selectors return existing references.

## 3. Loading gate — `src/components/AppLayout.tsx`

- `useEffect(() => { void load(); }, [load])` on mount.
- The header always renders. Below it:
  - `idle` / `loading` → `<main className="session-page" role="status">Loading…</main>`
  - `error` → message via `getApiErrorMessage(error, 'Unable to load lessons.')` and a
    "Try again" button calling `load()`
  - `ready` → `<Outlet context={user} />`
- Pages therefore assume data is loaded.

## 4. Pages

| Page | Change |
|---|---|
| `HomePage` | Read `useTopics()` / `useLessons()`; remove pending/error/retry markup. |
| `TopicsPage` | Read `useTopics()`; remove pending/error/retry markup. |
| `TopicPage` | `useTopic(id)` + `useTopicLessons(id)`; render "Topic not found." when the topic is missing; remove API error branch. |
| `LessonsPage` | Read `useTopics()`; remove pending/error/retry markup and `groupByTopic`. |
| `LessonsTopicItem` | Takes only `topic`; calls `useTopicLessons(topic.id)` itself. |
| `LessonPage` | `useLesson(id)`; render "Lesson not found." when missing; remove API error branch. |

Not-found pages keep `PageHeader` (title "Topic" / "Lesson") so the back button works.

## 5. Removed

- `getTopic` (`topics.api.ts`), `getLesson` (`lessons.api.ts`), and the `topicId`
  parameter of `getAllLessons`.
- TanStack Query usage in `useTopics.ts` and `useLessons.ts`, including the
  `placeholderData` cache lookups.

## 6. Sign-out

`useLogout` additionally calls `useCatalogStore.getState().reset()`, so a new login in
the same tab loads fresh data.

## 7. Error handling

| Case | Behaviour |
|---|---|
| Initial load fails | Single error screen with "Try again"; header (sign out) still usable. |
| Unknown topic/lesson id in URL | "not found" message; back button works. |
| Server data changes mid-session | Not shown until reload or next login (accepted). |

## 8. Verification

- `npm run build` (`tsc --noEmit && vite build`) and `prettier --check src` pass.
- Manual (`npm run dev`):
  1. Log in → Network tab shows exactly `GET /topics` and `GET /lessons` (each may
     page if there are more than 100 items).
  2. Browse home → Topics → topic → Lessons → lesson → no further requests.
  3. Sign out and log in again → data loads again.
  4. Visit `/topics/<unknown-uuid>` and `/lessons/<unknown-uuid>` → "not found".
- No unit tests in this step (the web app has no test runner); adding Vitest for
  selectors is a follow-up.

## Out of scope

IndexedDB persistence, user answers, offline sync, lesson points, background refresh,
Vitest setup.
