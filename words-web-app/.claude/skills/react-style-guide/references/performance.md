# Performance

Measure first. Most React code is fast enough without tuning, and premature memoization adds noise and bugs (stale closures, wrong dependencies).

## Find the real problem

1. Reproduce the slowness on a realistic device (throttle the CPU in DevTools).
2. Record with the React DevTools Profiler and look at which components render, how often, and how long they take.
3. Fix the cause. Usually it's state placed too high, a new object or array passed on every render, or an expensive computation during render.

## Cheaper fixes before memoization

- **Move state down**, into the component that uses it, so fewer components re-render.
- **Lift content up:** pass expensive children as `children`. Children created by the parent don't re-render when the wrapper's own state changes.
- **Select narrowly from stores.** A component subscribed to a whole store re-renders on every change. Select only the fields it needs (in Zustand, use `useShallow` when the selector returns a new array or object).

## Memoization, when justified

| Tool          | Use when                                                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `useMemo`     | a computation is measurably slow (sorting or filtering thousands of items), or a derived object must keep its identity for a dependency |
| `useCallback` | a function is a dependency of an effect, or a prop of a `memo` child                                                                    |
| `memo`        | a component re-renders often with the same props and its render is expensive                                                            |

If the React Compiler is enabled, it handles most of this automatically. Write pure components and drop manual memoization that has no measured benefit.

## Lists

- Lists of a few hundred simple rows are fine.
- Beyond roughly 1,000 rows, or with heavy rows, virtualize (e.g. `@tanstack/react-virtual`), so only visible rows are rendered.

## Loading and bundle size

- Split routes with `lazy(() => import('./SomePage'))` plus `<Suspense fallback>`, so users download only the pages they visit.
- Import only what you use from large libraries.
- Give images explicit `width` and `height` (or `aspect-ratio`) to avoid layout shift, use `loading="lazy"` below the fold, and serve sized or modern formats.

## Transitions

Wrap non-urgent updates (filtering a big list while the user types) in `startTransition` or `useDeferredValue`, so input stays responsive.
