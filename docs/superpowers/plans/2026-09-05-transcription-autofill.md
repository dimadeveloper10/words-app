# Transcription Autofill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically fill IPA transcription in the Add word dialog after a 500 ms typing pause without overwriting manual input.

**Architecture:** A standalone NestJS `DictionaryModule` owns the Free Dictionary API integration and exposes one admin-only endpoint. A matching admin dictionary feature wraps that endpoint with TanStack Query, while `WordDialog` owns the form-specific debounce and manual-override rules.

**Tech Stack:** NestJS 11, class-validator/class-transformer, Node.js `fetch`, React 19, React Hook Form, TanStack Query 5, Axios, TypeScript.

**Spec:** `docs/superpowers/specs/2026-09-05-transcription-autofill-design.md`

## Global Constraints

- Keep the external integration out of `WordsService` and the `/words` routes.
- Use `GET /dictionary/transcription?word=<word>` and restrict it with `@Roles(Role.ADMIN)`.
- Use Free Dictionary API at `https://api.dictionaryapi.dev/api/v2/entries/en/<word>`.
- Validate a non-empty word with a maximum length of 100 characters.
- Use the built-in Node.js `fetch`; add no dependency.
- Timeout provider requests after three seconds.
- Treat provider 404 or missing IPA as `{ transcription: null }`; map other provider failures to HTTP 503.
- Debounce admin lookups by 500 ms and cache successful results for 24 hours.
- Enable autofill only for Add word, and never overwrite a transcription after manual interaction.
- Do not add automated tests, per the user's explicit request. Run the existing backend suite and all available lint/build checks.
- Use WA-38 commit messages following the repository convention.

---

### Task 1: Add the isolated dictionary API feature

**Files:**

- Create: `api/src/dictionary/dto/query-transcription.dto.ts`
- Create: `api/src/dictionary/interfaces/dictionary-api-response.interface.ts`
- Create: `api/src/dictionary/dictionary.service.ts`
- Create: `api/src/dictionary/dictionary.controller.ts`
- Create: `api/src/dictionary/dictionary.module.ts`
- Modify: `api/src/app.module.ts`

**Interfaces:**

- Consumes: Free Dictionary API `GET /api/v2/entries/en/<word>`.
- Produces: `DictionaryService.findTranscription(word: string): Promise<string | null>`.
- Produces: authenticated `GET /dictionary/transcription?word=<word>` returning `Promise<{ transcription: string | null }>`.

- [ ] **Step 1: Add the validated query DTO**

Create `api/src/dictionary/dto/query-transcription.dto.ts`:

```ts
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class QueryTranscriptionDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  word!: string;
}
```

- [ ] **Step 2: Define only the provider fields the parser needs**

Create `api/src/dictionary/interfaces/dictionary-api-response.interface.ts`:

```ts
export interface DictionaryApiPhonetic {
  text?: unknown;
}

export interface DictionaryApiEntry {
  phonetic?: unknown;
  phonetics?: unknown;
}
```

Keeping uncertain external fields as `unknown` forces the service to validate
them before returning a string.

- [ ] **Step 3: Implement provider lookup and defensive IPA extraction**

Create `api/src/dictionary/dictionary.service.ts`:

```ts
import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import type {
  DictionaryApiEntry,
  DictionaryApiPhonetic,
} from "./interfaces/dictionary-api-response.interface";

const DICTIONARY_API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";
const DICTIONARY_TIMEOUT_MS = 3_000;

@Injectable()
export class DictionaryService {
  async findTranscription(word: string): Promise<string | null> {
    const normalizedWord = word.trim().toLowerCase();

    try {
      const response = await fetch(
        `${DICTIONARY_API_URL}/${encodeURIComponent(normalizedWord)}`,
        { signal: AbortSignal.timeout(DICTIONARY_TIMEOUT_MS) },
      );

      if (response.status === 404) return null;
      if (!response.ok)
        throw new Error(`Dictionary API returned ${response.status}`);

      return this.extractTranscription(await response.json());
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException("Dictionary service unavailable");
    }
  }

  private extractTranscription(payload: unknown): string | null {
    if (!Array.isArray(payload)) return null;

    for (const item of payload as DictionaryApiEntry[]) {
      if (typeof item?.phonetic === "string" && item.phonetic.trim()) {
        return item.phonetic.trim();
      }

      if (!Array.isArray(item?.phonetics)) continue;
      const phonetic = (item.phonetics as DictionaryApiPhonetic[]).find(
        (candidate) =>
          typeof candidate?.text === "string" && candidate.text.trim(),
      );
      if (typeof phonetic?.text === "string") return phonetic.text.trim();
    }

    return null;
  }
}
```

Do not add provider retries: the lookup is optional, and retries would amplify
traffic while the administrator is typing.

- [ ] **Step 4: Expose the admin-only controller and module**

Create `api/src/dictionary/dictionary.controller.ts`:

```ts
import { Controller, Get, Query } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "../common/enums/role.enum";
import { DictionaryService } from "./dictionary.service";
import { QueryTranscriptionDto } from "./dto/query-transcription.dto";

@Controller("dictionary")
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Get("transcription")
  @Roles(Role.ADMIN)
  async findTranscription(
    @Query() query: QueryTranscriptionDto,
  ): Promise<{ transcription: string | null }> {
    return {
      transcription: await this.dictionaryService.findTranscription(query.word),
    };
  }
}
```

Create `api/src/dictionary/dictionary.module.ts`:

```ts
import { Module } from "@nestjs/common";
import { DictionaryController } from "./dictionary.controller";
import { DictionaryService } from "./dictionary.service";

@Module({
  controllers: [DictionaryController],
  providers: [DictionaryService],
})
export class DictionaryModule {}
```

Import `DictionaryModule` in `api/src/app.module.ts` and append it to the
`imports` array after the existing feature modules.

- [ ] **Step 5: Verify the backend deliverable**

Run:

```bash
cd api
npx prettier --check "src/dictionary/**/*.ts" src/app.module.ts
npx eslint "src/dictionary/**/*.ts" src/app.module.ts
npm run build
npm test -- --runInBand
```

Expected: every command exits 0. The existing test count remains unchanged.

Check the provider contract directly:

```bash
curl --fail --silent --show-error \
  https://api.dictionaryapi.dev/api/v2/entries/en/run
```

Expected: JSON array containing either a non-empty `phonetic` or at least one
non-empty `phonetics[].text`.

- [ ] **Step 6: Commit the backend boundary**

```bash
git add api/src/dictionary api/src/app.module.ts
git commit -m "[WA-38] Api: add dictionary transcription lookup"
```

---

### Task 2: Add the admin dictionary client

**Files:**

- Create: `admin/src/features/dictionary/dictionary.api.ts`
- Create: `admin/src/features/dictionary/useDictionaryTranscription.ts`

**Interfaces:**

- Consumes: `GET /dictionary/transcription?word=<word>`.
- Produces: `getDictionaryTranscription(word: string, signal?: AbortSignal): Promise<{ transcription: string | null }>`.
- Produces: `useDictionaryTranscription(word: string, enabled: boolean)` returning a TanStack Query result.

- [ ] **Step 1: Add the cancellable API function**

Create `admin/src/features/dictionary/dictionary.api.ts`:

```ts
import { api } from "@/lib/api";

export interface DictionaryTranscriptionResponse {
  transcription: string | null;
}

export async function getDictionaryTranscription(
  word: string,
  signal?: AbortSignal,
): Promise<DictionaryTranscriptionResponse> {
  const { data } = await api.get<DictionaryTranscriptionResponse>(
    "/dictionary/transcription",
    { params: { word }, signal },
  );
  return data;
}
```

- [ ] **Step 2: Add the cached query hook**

Create `admin/src/features/dictionary/useDictionaryTranscription.ts`:

```ts
import { useQuery } from "@tanstack/react-query";
import { getDictionaryTranscription } from "./dictionary.api";

const TRANSCRIPTION_STALE_TIME_MS = 24 * 60 * 60 * 1_000;

export function useDictionaryTranscription(word: string, enabled: boolean) {
  const normalizedWord = word.trim().toLowerCase();

  return useQuery({
    queryKey: ["dictionary", "transcription", normalizedWord],
    queryFn: ({ signal }) => getDictionaryTranscription(normalizedWord, signal),
    enabled: enabled && normalizedWord.length > 0,
    staleTime: TRANSCRIPTION_STALE_TIME_MS,
    retry: false,
  });
}
```

- [ ] **Step 3: Verify and commit the admin client**

Run:

```bash
cd admin
npx prettier --check src/features/dictionary/*.ts
npx eslint src/features/dictionary/*.ts
npm run build
```

Expected: all commands exit 0.

Commit:

```bash
git add admin/src/features/dictionary
git commit -m "[WA-38] Admin: add dictionary transcription client"
```

---

### Task 3: Connect debounced autofill to Add word

**Files:**

- Modify: `admin/src/features/words/word-dialog/WordDialog.tsx`

**Interfaces:**

- Consumes: `useDictionaryTranscription(word: string, enabled: boolean)` from Task 2.
- Consumes: existing `useDebouncedValue<T>(value: T, delayMs?: number)`.
- Produces: Add word autofill with a permanent per-dialog manual-override guard.

- [ ] **Step 1: Add form observation and lookup state**

Update imports in `WordDialog.tsx`:

```ts
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useDictionaryTranscription } from "@/features/dictionary/useDictionaryTranscription";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
```

After `const isEdit = word !== undefined`, add:

```ts
const transcriptionManuallyEdited = useRef(false);
const watchedWord = useWatch({ control: form.control, name: "word" });
const debouncedWord = useDebouncedValue(watchedWord, 500);
const transcriptionQuery = useDictionaryTranscription(
  debouncedWord,
  !isEdit && !transcriptionManuallyEdited.current,
);
```

- [ ] **Step 2: Apply only a current, non-manual lookup result**

Add this effect before `onSubmit`:

```ts
useEffect(() => {
  const normalizedCurrentWord = watchedWord.trim().toLowerCase();
  const normalizedDebouncedWord = debouncedWord.trim().toLowerCase();
  const transcription = transcriptionQuery.data?.transcription;

  if (
    isEdit ||
    transcriptionManuallyEdited.current ||
    normalizedCurrentWord !== normalizedDebouncedWord ||
    !transcription
  ) {
    return;
  }

  form.setValue("transcription", transcription, {
    shouldDirty: false,
    shouldTouch: false,
    shouldValidate: false,
  });
}, [debouncedWord, form, isEdit, transcriptionQuery.data, watchedWord]);
```

The normalized-word comparison rejects a late response for the previous word
during the 500 ms debounce window.

- [ ] **Step 3: Clear stale automatic values when Word changes**

Replace the Word input with an explicit change handler:

```tsx
<Input
  placeholder="e.g. run"
  {...field}
  onChange={(event) => {
    field.onChange(event);
    if (!isEdit && !transcriptionManuallyEdited.current) {
      form.setValue("transcription", "", {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }}
/>
```

- [ ] **Step 4: Protect manual transcription input**

Replace the Transcription input with:

```tsx
<Input
  placeholder="e.g. /rʌn/"
  {...field}
  onChange={(event) => {
    transcriptionManuallyEdited.current = true;
    field.onChange(event);
  }}
/>
```

Do not show a toast or validation message for `transcriptionQuery.error`; the
field remains editable and word submission remains independent of lookup.

- [ ] **Step 5: Verify the admin integration**

Run:

```bash
cd admin
npx prettier --check \
  src/features/dictionary/*.ts \
  src/features/words/word-dialog/WordDialog.tsx
npx eslint \
  src/features/dictionary/*.ts \
  src/features/words/word-dialog/WordDialog.tsx
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 6: Manually verify behavior**

Start the API with `cd api && npm run start:dev` and the admin panel with
`cd admin && npm run dev`. Sign in as an admin and verify:

1. In Add word, typing `run` and pausing for at least 500 ms fills Transcription.
2. Changing `run` to `hello` before editing Transcription clears the old IPA
   and fills the latest lookup result only.
3. Editing Transcription manually, then changing Word, preserves the manual
   value.
4. Typing a nonexistent word leaves Transcription empty and shows no toast.
5. In Edit word, changing Word performs no lookup and does not clear the saved
   transcription.
6. Saving a word still uses the existing create/update flow.

- [ ] **Step 7: Commit the form integration**

```bash
git add admin/src/features/words/word-dialog/WordDialog.tsx
git commit -m "[WA-38] Admin: autofill word transcription"
```

---

### Task 4: Run final cross-application verification

**Files:**

- Verify only; no file changes expected.

**Interfaces:**

- Consumes: completed Dictionary API and Add word integration.
- Produces: evidence that the complete request/data flow builds and existing backend behavior remains green.

- [ ] **Step 1: Run final backend verification**

```bash
cd api
npx prettier --check "src/dictionary/**/*.ts" src/app.module.ts
npx eslint "src/dictionary/**/*.ts" src/app.module.ts
npm test -- --runInBand
npm run build
```

- [ ] **Step 2: Run final admin verification**

```bash
cd admin
npx prettier --check \
  src/features/dictionary/*.ts \
  src/features/words/word-dialog/WordDialog.tsx
npm run lint
npm run build
```

- [ ] **Step 3: Check repository state**

```bash
git status --short
git log -4 --oneline
```

Expected: no uncommitted implementation files and three WA-38 implementation
commits after the plan/spec commits.
