---
name: react-style-guide
description: Modern React 19 + TypeScript best practices and style guide for the words-web-app. Use this whenever you write, change, refactor or explain React components, custom hooks, state, effects, forms, styling or routing in words-web-app — even for a small tweak to a .tsx file, and even if the user doesn't mention "best practices" or "style". Also use it when the user asks how something "should" be done in React, or when another skill (react-review, react-feature) points here.
---

# React style guide

These are the conventions for React code in this app. They follow current React 19 practice. The aim is code that is predictable to read, safe to change, and easy to learn from. When a rule and existing code disagree, follow the rule for new code and mention the mismatch instead of silently rewriting unrelated code.

## Core rules

1. **Components are pure functions of props and state.** Rendering must not mutate anything, fetch, or subscribe. Pure renders let React re-run, pause or skip work safely, and keep the code ready for the React Compiler.
2. **Derive, don't sync.** If a value can be computed from props or state, compute it during render. An effect that copies state into other state is a bug waiting to happen (an extra render, a frame of stale UI).
3. **Effects are for synchronizing with external systems** (timers, browser APIs, subscriptions, imperative widgets), and every effect that starts something cleans it up.
4. **Keep state as local as possible** and lift it only when two siblings need it. Global stores are for app-wide data, not for avoiding a prop.
5. **Server data lives in a server-state tool** (TanStack Query, or the app's persisted store). Don't copy it into `useState`.
6. **One component per file, named exports, PascalCase names.** Never define a component inside another component, because it remounts on every render and loses its state.
7. **Type everything explicitly at the boundaries:** props interfaces, hook return types and component return types (`JSX.Element`, or `ReactNode` when the component can return a prop as-is). The lint config enforces return types.
8. **Use semantic HTML first.** A `<button>` beats a clickable `<div>`, and native elements bring keyboard support and accessibility for free.
9. **Keys come from stable ids**, never from array indexes, so that state stays attached to the right item when the list changes.
10. **Optimize only with a reason.** `memo`, `useMemo` and `useCallback` all have a cost. Reach for them when profiling, a stable dependency, or a measurably expensive computation calls for it.

## Topic references

Read only the file that matches the task:

| When you are…                                                 | Read                            |
| ------------------------------------------------------------- | ------------------------------- |
| writing or splitting components, props, lists, conditional UI | `references/components.md`      |
| using state, effects, refs, custom hooks, data fetching       | `references/hooks-and-state.md` |
| typing props, hooks, events, generics                         | `references/typescript.md`      |
| writing CSS, class names, layout                              | `references/styling.md`         |
| building forms, dialogs, buttons, images, navigation          | `references/accessibility.md`   |
| dealing with slow renders, big lists, bundle size             | `references/performance.md`     |

## Explaining choices

This is a learning project. When you apply a rule, briefly say which one and why it fits, in prose. Code snippets stay comment-free, because the explanation belongs in the answer.
