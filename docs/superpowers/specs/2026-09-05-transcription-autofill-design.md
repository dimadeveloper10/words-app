# Transcription Autofill Design

## Goal

Automatically fill the transcription field in the **Add word** dialog after
the administrator pauses while typing an English word. Manual transcription
input must always take precedence.

## Scope

The feature adds an isolated dictionary integration to the NestJS API and a
small dictionary client feature to the React admin panel. It does not change
the words database schema, `WordsService`, word create/update payloads, or the
edit-word autofill behavior.

## External provider

The backend will use the Free Dictionary API endpoint:

`GET https://api.dictionaryapi.dev/api/v2/entries/en/<word>`

The provider returns a top-level `phonetic` value and may also return values in
`phonetics[].text`. The integration will select the first non-empty value in
that order. Keeping provider-specific parsing in the backend prevents the
admin panel from depending on the external response format.

## Backend design

Add a standalone `DictionaryModule` and register it in `AppModule`:

```text
api/src/dictionary/
  dictionary.module.ts
  dictionary.controller.ts
  dictionary.service.ts
  dto/query-transcription.dto.ts
  interfaces/dictionary-api-response.interface.ts
```

The authenticated admin endpoint is:

`GET /dictionary/transcription?word=run`

It returns:

```json
{ "transcription": "rʌn" }
```

or, when the word or IPA value is unavailable:

```json
{ "transcription": null }
```

`QueryTranscriptionDto` validates that `word` is a non-empty string no longer
than 100 characters. `DictionaryService` trims and lowercases the word,
URL-encodes it, and calls the provider using the Node.js built-in `fetch` with
a three-second timeout. No new package is required.

The service treats provider `404` as a normal missing result. Other non-2xx
responses, timeouts, invalid JSON, and network failures become a NestJS
`ServiceUnavailableException`. The controller is restricted with
`@Roles(Role.ADMIN)`, which also permits superadmins through the existing role
hierarchy.

## Admin design

Add an isolated dictionary feature:

```text
admin/src/features/dictionary/
  dictionary.api.ts
  useDictionaryTranscription.ts
```

The API function accepts an `AbortSignal` so TanStack Query can cancel an
obsolete request when the typed word changes. The query key includes the
normalized word, and successful results use a 24-hour `staleTime` to avoid
repeated provider calls for the same spelling during normal admin use.

`WordDialog` watches the `word` field and passes it through the existing
`useDebouncedValue` hook with a 500 ms delay. Lookup is enabled only when:

- the dialog is creating a word, not editing one;
- the normalized word is non-empty; and
- the transcription has not been edited manually.

Before manual transcription input, changing the word clears the previous
automatically supplied transcription. When the latest lookup returns a value,
the dialog writes it with `react-hook-form`'s `setValue` without marking the
field as manually dirty. The transcription input's own change handler records
manual interaction before forwarding the value to React Hook Form. Once that
flag is set, current and future lookup responses cannot overwrite the field.

Lookup errors and missing values leave the transcription empty. They do not
show toast notifications because requests happen while typing and an external
dictionary failure must not block creating a word manually.

## Request and data flow

1. The administrator types in **Word**.
2. The admin waits for 500 ms of inactivity.
3. TanStack Query requests `/dictionary/transcription?word=<word>`.
4. `DictionaryService` requests the Free Dictionary API and extracts IPA.
5. The API returns `{ transcription }` or `{ transcription: null }`.
6. `WordDialog` fills the transcription only if the user has not edited it.
7. Normal word submission continues through the existing `/words` endpoint.

## Verification

No new automated tests will be added, following the user's explicit request.
Verification will consist of:

- running the existing backend test suite;
- running API and admin lint/build commands;
- checking successful, missing-word, and provider-failure responses;
- manually confirming debounce, autofill, word changes, and manual-override
  behavior in the Add word dialog;
- confirming Edit word never performs an automatic lookup.

## Trade-offs

The free provider has no service-level guarantee, so autofill is deliberately
optional and failure-tolerant. A backend boundary adds a small amount of code,
but avoids CORS coupling in the browser and provides one replacement point if
the project later adopts a paid or self-hosted dictionary.
