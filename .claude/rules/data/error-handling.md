---
paths:
  - 'apps/**/*.{ts,tsx}'
  - 'packages/api-sdk/**/*.{ts,tsx}'
  - 'packages/schemas/**/*.{ts,tsx}'
  - 'packages/shared/**/*.{ts,tsx}'
description: The standard error flow (HTTP to ApiError to UI) and the error-type-to-UI-response mapping.
---

# Error handling conventions

## Standard error flow

```text
HTTP non-2xx
  -> ErrorEnvelopeSchema.safeParse
  -> ApiError(status, code, message, details)
  -> query/mutation boundary
  -> a message or error state appropriate to the context
  -> monitoring, if the error is abnormal
```

- Only `@repo/api-sdk` turns an HTTP response into an `ApiError`; do not create a second API error class in an app.
- The error body uses `ErrorEnvelopeSchema`; if the payload doesn't match the contract, return a safe `UNKNOWN_ERROR` instead of trusting response fields directly.
- `catch` receives `unknown`. Narrow it with `instanceof ApiError`, a Zod result, or a type guard; do not cast `as Error` just to read `message`.
- Do not swallow errors with an empty `catch {}`. If ignoring one is intentional, add a comment (Vietnamese is fine) stating why, and make sure the UI does not get stuck in a loading state.
- Never log tokens, cookies, passwords, personal data, or a full sensitive response. `console.log` is forbidden; only `console.warn`/`console.error` for deliberate cases.

## Classification and response

| Error type                  | How to handle it                                                                                      |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| Validation 400/422          | Show near the field/form when it can be mapped; keep the user's entered data                          |
| 401                         | Let the auth runtime perform a single-flight refresh; on failure, clear the session and go to sign-in |
| 403                         | Show a not-authorized state; do not pretend it's a 404 unless the contract requires it                |
| 404                         | Use a not-found/empty state appropriate to the route or resource                                      |
| 409/domain conflict         | Keep the current UI, explain the conflict, and offer a next action                                    |
| 429                         | Show a rate-limit message with controlled retry; no automatic loop                                    |
| 5xx/network                 | Neutral error state/toast, with retry when the operation is idempotent                                |
| Programming error/invariant | Do not disguise it as a business message; let an error boundary/monitoring capture it                 |

## Query, mutation and UI

- A query error affecting a whole content area: render `ErrorState` with retry/refetch. Do not just toast and leave the screen blank.
- A mutation error: shown once at the mutation boundary. Storefront prefers `useApiMutation`; do not toast from both QueryClient and the component at the same time.
- Predictable form validation should run before the request; server errors are still the final source of truth.
- Never show a raw stack trace, status text, or `error.details` directly to the user.
- User-facing messages must go through the app's i18n. A backend message is only used when the contract confirms it is safe to display, always with a locale fallback.
- Retry only for safe/idempotent operations, or when the backend supports idempotency. Never auto-retry a create-order/payment-like mutation.
- A loading flag must be released on both success and failure; prefer state already provided by TanStack Query/React Hook Form over a parallel hand-rolled one.

## Error boundaries and monitoring

- Use the `error.tsx` route for render/data errors that cannot be recovered locally in Storefront; expected query/form errors are handled at the feature level.
- An error boundary must offer a retry or a safe navigation action and must not take down the whole app shell if a smaller boundary is enough.
- Only send monitoring events for abnormal errors; do not report validation/user-cancel as a production exception.
- When adding a new error code, update the schema/contract, the UI mapping, fixtures/MSW, and the failure-path test.
