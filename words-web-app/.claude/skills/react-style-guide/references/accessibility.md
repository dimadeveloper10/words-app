# Accessibility

Accessible markup is also more robust and easier to test. Most of it comes free from choosing the right element.

## Semantic elements first

| Need            | Use                                                     | Not                           |
| --------------- | ------------------------------------------------------- | ----------------------------- |
| an action       | `<button type="button">`                                | `<div onClick>`               |
| navigation      | `<Link>` / `<a href>`                                   | `<button onClick={navigate}>` |
| a list of items | `<ul>` / `<ol>` + `<li>`                                | a stack of `<div>`s           |
| page structure  | `<header>`, `<main>`, `<nav>`, `<section>`, `<article>` | anonymous wrappers            |
| a heading       | `<h1>`–`<h6>` in order                                  | bold text                     |

Native elements bring focus, keyboard handling and screen-reader roles for free. Add `aria-*` attributes only when no native element expresses the meaning. Wrong ARIA is worse than none.

## Forms

- Every input has a visible `<label>`, connected with `htmlFor` and an `id` from `useId()`.
- Link error messages with `aria-describedby` and mark invalid fields with `aria-invalid`.
- Submit with a `<form onSubmit>`, so Enter works and the browser handles it natively.
- Give buttons in a form an explicit `type`, because the default `submit` can trigger by accident.

```tsx
const id = useId();
return (
  <div>
    <label htmlFor={id}>Email</label>
    <input
      id={id}
      type="email"
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
    />
    {error && <p id={`${id}-error`}>{error}</p>}
  </div>
);
```

## Dialogs and focus

- Prefer the native `<dialog>` with `showModal()`. It traps focus, handles Escape, and makes the page behind it inert.
- Label the dialog with `aria-labelledby` pointing at its title.
- Return focus to the triggering element when it closes.

## Images and icons

- Content images get meaningful `alt` text. Decorative images get `alt=""`.
- Decorative SVG icons get `aria-hidden="true"`. Icon-only buttons need an `aria-label`.

## Dynamic feedback

Announce results that appear without a page change (a correct or wrong answer, a saved toast) with a live region (`role="status"` or `aria-live="polite"`).

## Keyboard and visuals

- Everything clickable is reachable with Tab and works with Enter or Space.
- Never remove focus outlines without replacing them with a visible `:focus-visible` style.
- Don't convey meaning by colour alone (e.g. right or wrong): add an icon or text.
- Keep text contrast at WCAG AA at least (4.5:1 for body text).
