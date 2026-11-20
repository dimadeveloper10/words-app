# Hooks and state

## Rules of Hooks

Call hooks only at the top level of a component or custom hook, never inside conditions, loops or callbacks. React identifies each hook by its call order, so a conditional hook shifts every hook after it. `eslint-plugin-react-hooks` checks this. Don't disable the rule; restructure the code instead.

## Choosing where state lives

| The data is…                                           | Put it in                                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| used by one component (input text, open/closed)        | `useState` in that component                                                         |
| shared by a few nearby components                      | the closest common parent, passed down as props                                      |
| complex transitions with several related fields        | `useReducer`                                                                         |
| app-wide client state (session, settings)              | a store such as Zustand, read through selectors                                      |
| data owned by the server                               | TanStack Query, or the app's persisted catalog store; never mirrored into `useState` |
| something that should survive a reload or be shareable | the URL (route params, search params)                                                |

## Derive instead of syncing

❌ An effect that copies props into state renders twice and can show stale data for a frame.

```tsx
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${first} ${last}`);
}, [first, last]);
```

✅ Compute it during render.

```tsx
const fullName = `${first} ${last}`;
```

Wrap the computation in `useMemo` only when it is measurably expensive.

To reset all state when an identity changes (e.g. a new lesson id), give the component a `key` instead of writing a reset effect:

```tsx
<LessonEditor key={lessonId} lessonId={lessonId} />
```

## Effects

Use an effect only to synchronize with something outside React. Always return a cleanup when the effect starts something.

```tsx
useEffect(() => {
  const timer = setTimeout(onAdvance, delayMs);
  return () => clearTimeout(timer);
}, [onAdvance, delayMs]);
```

Things that do _not_ need an effect:

- **Handling a user action:** do it in the event handler.
- **Transforming data for display:** derive it.
- **Fetching:** use the data layer (TanStack Query), which handles race conditions, caching and retries.

List every value the effect reads in its dependencies. If the list keeps changing, fix the cause (move the function inside the effect, or memoize it on purpose) rather than omitting dependencies.

## Refs

Use `useRef` for values that must persist without causing a re-render (timer ids, the previous value, DOM nodes). Don't read or write `ref.current` during render, because the render must stay pure. Access it in effects and handlers.

## Stable identifiers

Use `useId()` for ids that tie together labels, inputs and `aria-*` attributes. Never `Math.random()` during render, because ids would differ between renders.

## Custom hooks

Extract a custom hook when a component mixes logic and markup, or when logic is reused.

- Name it `useSomething` and give it a single responsibility.
- Return a named type, so callers and reviewers see the contract.
- Return only what callers need, not internal setters.

```ts
interface Countdown {
  secondsLeft: number;
  isDone: boolean;
}

export function useCountdown(seconds: number): Countdown {
  const [secondsLeft, setSecondsLeft] = useState(seconds);

  useEffect(() => {
    if (secondsLeft === 0) {
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return { secondsLeft, isDone: secondsLeft === 0 };
}
```

## Updating state

- Use the updater form when the next state depends on the previous one: `setCount((c) => c + 1)`.
- Treat state as immutable. Create new arrays and objects (`[...items, item]`, `{ ...user, name }`) instead of mutating them, or React won't see the change.
- Group state that always changes together into one object or a reducer, and keep independent values separate.

## Server state with TanStack Query

- Define the query keys in one place per feature, as arrays from general to specific: `['lessons', lessonId, 'words']`.
- Wrap each query and mutation in a feature hook (`useLesson(id)`) so components never build keys or call the API directly.
- After a mutation, invalidate the affected keys instead of patching caches by hand, unless you are doing a deliberate optimistic update.
- Read `isPending` and `error` from the query. Don't keep parallel `loading` flags in state.

## React 19 notes

- `ref` is a regular prop on function components, so new code doesn't need `forwardRef`.
- `use(promise)` and `use(context)` exist. Prefer the app's data layer for fetching; `use` fits Suspense-based APIs.
- Actions (`useActionState`, `useFormStatus`, `useOptimistic`) suit form submissions without a form library. When the app already uses react-hook-form for a form, stay consistent with it.
