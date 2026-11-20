# Components

## Shape of a component file

Put the props interface first, then the exported component, then small private helpers. Keep one exported component per file, with the file named after it.

```tsx
import type { JSX } from 'react';

interface LessonCardProps {
  title: string;
  wordCount: number;
  onOpen: () => void;
}

export function LessonCard({
  title,
  wordCount,
  onOpen,
}: LessonCardProps): JSX.Element {
  return (
    <article className="lesson-card">
      <h3 className="lesson-card__title">{title}</h3>
      <p className="lesson-card__meta">{formatCount(wordCount)}</p>
      <button type="button" onClick={onOpen}>
        Open
      </button>
    </article>
  );
}

function formatCount(count: number): string {
  return `${count} ${count === 1 ? 'word' : 'words'}`;
}
```

Why:

- **Named exports** keep names consistent across imports and make renames safe.
- **Destructuring the props in the signature** documents what the component uses.
- Helpers that don't use hooks stay outside the component, so they aren't recreated on every render and are easy to unit-test.

## Never nest component definitions

❌ Defined inside the parent, `Row` is a new component type on every render. React unmounts and remounts it, so focus and input state are lost.

```tsx
export function WordList({ words }: WordListProps): JSX.Element {
  function Row({ word }: { word: Word }): JSX.Element {
    return <li>{word.text}</li>;
  }
  return (
    <ul>
      {words.map((w) => (
        <Row key={w.id} word={w} />
      ))}
    </ul>
  );
}
```

✅ Move it to module scope (or its own file) and pass data through props.

## Lists and keys

Use a stable, unique id from the data. With index keys, an inserted or removed item makes React reuse the wrong DOM and state.

```tsx
<ul>
  {words.map((word) => (
    <WordRow key={word.id} word={word} />
  ))}
</ul>
```

Use an index key only for static lists that never reorder and have no state.

## Conditional rendering

Return early for loading, empty and error states, so the main JSX handles only the happy path.

```tsx
if (words.length === 0) {
  return <EmptyState message="No words yet" />;
}
return <WordGrid words={words} />;
```

Avoid `{count && <Badge />}` when `count` can be `0`, because React renders the `0`. Use `{count > 0 && <Badge />}` or a ternary instead.

## Composition over prop drilling

When a component only passes a prop down to a child, accept `children` (or a slot prop) instead, so the parent composes the tree directly.

```tsx
<Card>
  <CardHeader title={lesson.name} />
  <LessonWords lessonId={lesson.id} />
</Card>
```

Reach for context only when many components at different depths need the same value (theme, current user). Context re-renders every consumer when its value changes, so keep the value small and stable.

## Props design

- Name event props `onSomething` and handlers inside the component `handleSomething`.
- Prefer a few explicit props over a large options object.
- Boolean props read as adjectives (`disabled`, `isActive`) and default to `false`.
- Avoid props that duplicate each other, like `isOpen` together with `status === 'open'`.

## Size

If a component grows past roughly one screen, or mixes data loading, state logic and markup, split it. Move the logic into a custom hook and pieces of markup into child components. The lint rule `max-lines-per-function` is a backstop, not the target.
