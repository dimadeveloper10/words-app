# Offline mode (web app) — proposal

Date: 2026-11-06
App: `words-web-app/`
Status: **proposal** — open questions at the end must be answered before step 1.

## Goal

Let a user practise without a reliable connection: answers are never lost, and the
app can start and show lessons with no network at all.

## Where we are

### Already in place

| | What | Where |
|---|---|---|
| ✅ | Client-generated answer UUIDs; identical retry → `200`, no duplicate | `api/src/modules/word-answers/word-answers.service.ts` |
| ✅ | Batch endpoint saves each answer independently, reports `failed` | `POST /word-answers/batch` |
| ✅ | All catalog data in one client store, read through selectors | `src/stores/catalog.ts` |
| ✅ | Auth token persisted | `src/stores/auth.ts` (`localStorage`) |

### What breaks offline today

| # | Severity | Problem | Cause |
|---|---|---|---|
| 1 | 🔴 | **Answers are lost** | `useSaveWordAnswers` sends once; on failure only a toast is shown |
| 2 | 🔴 | **App can't start** | `RequireAuth` needs `GET /auth/me`; `CatalogLoader` loads everything from the network |
| 3 | 🔴 | **Page won't load after reload** | No service worker — `index.html` and JS are not cached |
| 4 | 🟡 | Images missing | Only the browser HTTP cache, which is unreliable |
| 5 | 🟢 | Pronunciation | `speechSynthesis` uses local voices — usually works offline already |

## Plan — 4 independent steps

```
Step 1  Outbox for answers      → fixes #1 (data loss)
Step 2  Catalog in IndexedDB    → fixes #2 (app start)
Step 3  Service worker (PWA)    → fixes #3, #4 (page load, images)
Step 4  UX indicators           → makes the offline state visible
```

Each step ships on its own and is useful without the next ones.

---

### Step 1 — Outbox for answers

> Most value, least risk: fixes the only real data loss, needs no new libraries, the
> server side is already done.

**Store** — new `outbox` store with Zustand `persist`:

```ts
interface OutboxState {
  userId: string | null;
  pending: PendingWordAnswer[];
  enqueue: (lessonId: string, answers: PendingWordAnswer[]) => void;
  sync: () => Promise<void>;
}
```

**Flow:**

1. Exercise finishes → answers go to `outbox.pending` **and** to `catalog.answers`
   immediately, so lesson points update even offline.
2. `sync()` sends `pending` via `/word-answers/batch` (chunks of up to 200).
3. `sync()` runs on: app start · browser `online` event · after each exercise.

**Handling the response:**

| Result | Meaning | Action |
|---|---|---|
| id in `savedIds` | saved (new or identical retry) | remove from outbox |
| `failed`, status `4xx` | permanently rejected (e.g. word deleted) | remove + notify user |
| network error / `5xx` | temporary | keep, retry later |

Retrying is always safe thanks to the client UUIDs and identical-retry handling.

**Ownership:** the outbox stores `userId`. If a different user logs in, the previous
user's answers are not sent under the new account.

---

### Step 2 — Catalog in IndexedDB

- `persist` the `catalog` store into **IndexedDB** with a tiny adapter (`idb-keyval`,
  ~600 B).

  > 💡 **Why not localStorage?** ~5 MB limit, strings only, and **synchronous** —
  > parsing thousands of words would block rendering. IndexedDB is asynchronous and
  > allows hundreds of MB.

- **Stale-while-revalidate:** at startup show saved data immediately
  (`status: 'ready'`), then refresh in the background when online.
- Persisted data gets a `version` + `migrate`, so future store-shape changes don't
  break old saved data.
- **Auth:** `RequireAuth` must treat a **network error** differently from a **401**.
  Offline → use the persisted `user` and let the user in. Only a real 401 logs out.

---

### Step 3 — Service worker (PWA)

- **`vite-plugin-pwa`** (Workbox) precaches the **app shell** (HTML, JS, CSS) → the
  app opens with no network.
- **Runtime cache** for images: `CacheFirst` on `/uploads/*`, with a size limit.
- **Web manifest** → the app can be installed on a phone.

> ⚠️ A service worker can serve stale code. Keep it **disabled** in `npm run dev` and
> show a clear "New version available → Reload" prompt.

---

### Step 4 — UX

- Offline indicator in the header (`navigator.onLine` + `online`/`offline` events).
- Sync badge: **"🔄 3 answers waiting to sync"**.
- Warning at logout when the outbox is not empty (logging out would lose them).

## Trade-offs & edge cases

| Case | Behaviour |
|---|---|
| Token expires while offline | Answers stay in the outbox; sent after the **same** user logs in again |
| Word/lesson deleted on server while offline | Batch returns `4xx` for those answers → dropped, user notified; outbox never gets stuck |
| Another user logs in on the same device | Outbox belongs to the previous `userId` → not sent |
| Stale catalog | Background refresh when online (step 2) |

## Testing

- Good moment to add **Vitest**, starting with the sync decision logic
  (`savedIds` / `failed 4xx` / network error) — pure logic, easy to test without a
  browser.
- Manual: DevTools → Network → **Offline**, finish an exercise, go back online →
  answers appear in `POST /word-answers/batch` and the outbox empties.

## Recommendation

Start with **step 1**. Steps 2 and 3 are what let the app **start** offline.

## Open questions

1. **Target:** "practice in the subway" on a phone (installed PWA → step 3 is a
   must), or "don't lose answers on a flaky connection" (steps 1–2 are enough for
   now)?
2. **Task number:** continue under **WA-59** or a new one?
