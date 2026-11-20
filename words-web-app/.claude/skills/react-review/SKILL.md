---
name: react-review
description: Review React/TypeScript changes in words-web-app against the react-style-guide and report findings without editing code. Use this whenever the user asks to review, check, audit or critique React code, a component, a hook, a diff, a commit or a branch in the web app ("review my changes", "is this component ok?", "check the last commit", "anything wrong with this hook?"), even if they don't say "style guide".
---

# React review

Review web app changes for correctness and adherence to the `react-style-guide` skill, and explain each finding so the user learns the underlying rule. This skill reports; it doesn't change code unless the user asks for fixes afterwards.

## 1. Collect the changes

Pick the target from the request:

| Request                             | Command                            |
| ----------------------------------- | ---------------------------------- |
| nothing specific (uncommitted work) | `git diff` and `git diff --staged` |
| "last commit" / a commit hash       | `git show <hash>`                  |
| a branch                            | `git diff main...<branch>`         |
| specific files                      | read those files                   |

Limit the diff to `words-web-app/` (append `-- words-web-app` to git commands). If there are no changes, say so and stop.

Read the surrounding code of each changed hunk, not just the hunk itself. Many React bugs (missing cleanup, a wrong dependency, state that should be derived) only show up with context.

## 2. Check against the guide

Load the `react-style-guide` skill. Then read only the reference files that match what changed:

- components or JSX → `components.md`, `accessibility.md`
- hooks, state, effects, data → `hooks-and-state.md`
- types, props, events → `typescript.md`
- `.css` files or `className` → `styling.md`
- lists, memoization, heavy renders → `performance.md`

Look hardest at the bugs the guide exists to prevent:

- effects without cleanup, or with missing or incorrect dependencies;
- state synced from props through an effect;
- components defined inside components;
- index keys on dynamic lists;
- mutating state;
- conditional hooks;
- inaccessible interactive elements;
- `{count && …}` rendering `0`.

## 3. Run the automated checks

From `words-web-app/`:

- `npm run lint`
- `npx tsc --noEmit`

Don't use `tsc -b`, because it writes a `tsconfig.tsbuildinfo` file into the repo. Include the results; when they fail, tie each error back to a finding.

## 4. Report

Use this structure:

```
## React review: <target>

### 🔴 Bugs
- `path/File.tsx:42`: <what is wrong> → <concrete fix>
  _Rule:_ <guide rule> (<reference file>). <one sentence on why it matters>

### 🟡 Guideline issues
- …

### 💡 Suggestions
- …

### Checks
| Check | Result |
|---|---|
| lint | ✅ / ❌ … |
| tsc | ✅ / ❌ … |
```

- Omit empty sections, and say plainly when there are no findings.
- Severity: 🔴 is wrong behaviour or a likely bug; 🟡 breaks a guide rule without a current bug; 💡 is optional polish.
- Keep each finding to a few lines. Show a short code excerpt only when the fix isn't obvious from the description.
- Don't report formatting (Prettier owns that) or rules that lint already reported, other than linking them to findings.
- End by offering to apply the fixes. Don't apply them unprompted.
