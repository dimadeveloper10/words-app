# Styling

This app uses plain CSS files co-located with components, with no CSS-in-JS or utility framework.

## Co-location

Put a component's or page's styles in a file next to it with the same name (`LessonPage.tsx` + `LessonPage.css`) and import it from that component. Deleting a component then deletes its styles too.

## Class naming

Prefix every class with the component's block name, so styles from different files can't collide in the global stylesheet:

```css
.lesson-card {
}
.lesson-card__title {
}
.lesson-card--active {
}
```

- Block: the kebab-case component name.
- Element: `__part`.
- Modifier: `--state`.

Toggle modifiers with a conditional class, not inline styles:

```tsx
<li className={isActive ? 'topic-item topic-item--active' : 'topic-item'}>
```

## Design tokens

Define colours, spacing, radii and font sizes once as CSS custom properties on `:root` (in the global stylesheet) and use `var(--token)` everywhere. That keeps the look consistent and makes theming possible (e.g. dark mode via `@media (prefers-color-scheme: dark)` redefining the same tokens).

```css
.lesson-card {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
```

## Inline styles

Use `style={{ … }}` only for truly dynamic values computed at runtime (a progress width, a position). Everything static belongs in CSS.

## Layout

- Write mobile-first: base styles for small screens, then `@media (min-width: …)` for larger ones. This is a learning app that will mostly be used on phones.
- Use flexbox and grid with `gap` instead of margins between siblings.
- Use relative units (`rem`) for type and spacing, so user font settings are respected.
- Respect `prefers-reduced-motion` for animations.

## Don't

- Style by element type deep in a tree (`.page div span`): such styles are brittle and leak.
- Use `!important` to win a specificity fight: fix the selector instead.
- Use ids as styling hooks.
