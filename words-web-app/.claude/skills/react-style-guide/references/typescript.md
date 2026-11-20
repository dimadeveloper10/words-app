# TypeScript in React

## Return types

The lint config requires explicit return types.

- A component that always renders markup returns `JSX.Element`, with `import type { JSX } from 'react'`. React 19 removed the global `JSX` namespace, so the import is required.
- A component that can render nothing returns `JSX.Element | null`.
- A component that may return a `children` or `empty` prop as-is returns `ReactNode`, because that prop can be a string, `null` or an array.
- Inline callbacks (`.map`, event handlers passed in JSX) don't need annotations, because their types come from context.

## Props

Declare props as an `interface` named `<Component>Props`, directly above the component.

```tsx
interface ExerciseHeaderProps {
  title: string;
  progress: number;
  actions?: ReactNode;
}
```

To extend a native element, take its props type and spread the rest, so callers keep every native attribute:

```tsx
interface IconButtonProps extends ComponentProps<'button'> {
  label: string;
}

export function IconButton({
  label,
  children,
  ...rest
}: IconButtonProps): JSX.Element {
  return (
    <button type="button" aria-label={label} {...rest}>
      {children}
    </button>
  );
}
```

## Type-only imports

Use `import type { Word } from './words.types'` (or the inline `type` modifier) for anything used only as a type. It's erased at build time and makes clear which imports are runtime code.

## Model states, not flags

A discriminated union makes impossible combinations impossible:

❌ `{ isLoading: boolean; error?: string; data?: Word[] }` allows `isLoading` and `error` at the same time.

✅

```ts
type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; words: Word[] };
```

Then `switch (state.status)` narrows each branch, and TypeScript flags any missing case.

## Events

Type handlers with React's event types: `FormEvent<HTMLFormElement>`, `ChangeEvent<HTMLInputElement>`, `MouseEvent<HTMLButtonElement>`. Import them as types from `react`.

## Avoid

- `any`: use `unknown` and narrow it, or write the real type.
- Non-null assertions (`value!`) to silence errors: handle the `undefined` case, or fix the type at its source.
- `as` casts on API data: validate it at the boundary (e.g. with zod) and let types flow from there.
- `React.FC`: it adds little and used to imply `children`. Type the props and return value directly.

## Generics

Generic components work well for reusable list and selection UIs:

```tsx
interface CarouselProps<T> {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
}

export function Carousel<T>({
  items,
  getKey,
  renderItem,
}: CarouselProps<T>): JSX.Element {
  return (
    <ul>
      {items.map((item) => (
        <li key={getKey(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```
