---
paths:
  - 'apps/**/*.{ts,tsx}'
  - 'packages/shared/**/*.{ts,tsx}'
  - 'packages/ui/**/*.tsx'
description: Loading-state taxonomy plus toast ownership, content and dedupe rules.
---

# Loading state and toast message conventions

Loading and toast are two different kinds of feedback:

- Loading shows the progress of a specific region or a pending action.
- Toast is a short notification about an action's outcome or an event not stably tied to one UI region.

Toast is not a substitute for loading, inline validation, a query error state, or an error boundary.

## Loading classification

| State                                                  | Appropriate UI                                              |
| ------------------------------------------------------ | ----------------------------------------------------------- |
| App/session bootstrapping and cannot render safely yet | `PageLoader` or a shell skeleton                            |
| Route streaming/transitioning                          | `loading.tsx`/Suspense fallback near the route              |
| First query fetch, no data yet                         | A skeleton matching the layout, or `QueryState`             |
| Background refetch, data already present               | Keep the data; a small indicator if the user needs to know  |
| Local mutation/action                                  | Loading on the button/control that triggered it             |
| Form submit                                            | Disable submit, keep the form visible, change label/spinner |
| First load of a list/table                             | Row/card/table skeleton preserving size                     |
| Infinite load/pagination                               | Loader at the append/navigation area, not covering the page |

## TanStack Query state

- Distinguish initial loading from background fetching:
  - `isPending`/`isLoading` when there is no data yet: render a skeleton/loading state.
  - `isFetching` when data already exists: keep the current content; do not replace it entirely with a spinner.
  - `isPlaceholderData`: keep the layout/placeholder data and disable navigation that would create a duplicate request, when needed.
- A query with `enabled: false` may still report pending per TanStack Query semantics; only expose loading to the UI once the request's real conditions are met.
- Do not combine multiple queries with `isLoadingA || isLoadingB` if each region can render independently. Only combine when the whole view genuinely needs all the data to be valid.
- Do not copy query loading into local state via an effect. Use the query's state directly, or derive it in a controller hook.
- When a refetch fails but the stale data is still usable, keep the data and show non-destructive feedback; only switch to a full error state when the data is no longer safe to show.
- The first query error uses an inline `ErrorState`/`QueryState` with retry; do not just fire a toast and leave the content area empty.

## Skeleton, spinner and page loader

- Prefer a skeleton for content with a predictable layout: product grid, product detail, table, stat card.
- Use a spinner for small actions, unknown size/shape content, auth bootstrap, or a short fallback.
- `PageLoader` is only for when the app/route shell cannot render safely at all. Never block the whole page for one card or a local mutation.
- A skeleton should closely match the real content's size to avoid CLS; don't use a row/card count wildly different from typical data.
- Loading UI must not remove navigation/shell if the shell is still usable.
- Never show a skeleton and an empty/error state at the same time.
- Do not add an artificial delay just so a spinner is visible. If flicker prevention is needed, use a shared, tested delay/minimum-duration helper — not scattered component timers.
- Loading motion must respect reduced motion; a spinner needs an accessible label, and decorative icons use `aria-hidden` appropriately.

## Mutations and repeated actions

- Use `mutation.isPending` as the source of truth; do not create a parallel `isSubmitting` unless multiple operations with different lifecycles are involved.
- Disable exactly the control that triggers the mutation to prevent a double submit. Disable the whole form only when fields truly cannot change during the request.
- A pending button must:
  - Keep a stable width/layout.
  - Have an action-specific label: "Saving…", "Deleting…", "Placing order…".
  - Have `aria-busy={true}` when appropriate.
  - Keep the correct `type="submit"`/`type="button"` semantics.
- For multi-row lists, loading must be tied to the specific ID/action running; do not show every row as loading when only one item is being mutated, unless the mutation genuinely locks the whole collection.
- Destructive/checkout mutations must not auto-retry without an idempotency contract.
- Optimistic updates need a snapshot/rollback and exactly one place that fires the toast on commit or rollback.
- Navigate only after success when the flow requires it; do not clear the form/state before knowing the mutation succeeded.

## Toast ownership

- Use `notify` from `@repo/shared/notification`; components do not import `sonner` directly.
- One user action has exactly one toast owner. Prefer the mutation/controller hook; never fire from the API SDK, the global QueryClient, and the component at the same time.
- Storefront mutations use `useApiMutation` where appropriate to centralize success/error toast and avoid duplicates.
- The API SDK, schemas, mappers, and presentational components never fire a toast.
- The global QueryClient must not fire a generic mutation toast if the mutation hook already owns the feedback.
- Never fire a toast from the render body. Toasts fire only from an event/mutation/effect tied to a stable transition, and must avoid re-firing due to Strict Mode/remounts.
- Do not toast on every background refetch, polling tick, or automatic retry.

## When to use a toast

### Use a success toast when

- An action completes but the result isn't obvious enough in the current UI: saving a profile, updating a status, copying something, sending a request.
- A destructive action has undo: the toast includes an "Undo" action with a safe restore callback.
- The action happens inside a dialog/sheet that will close after success and needs a brief confirmation.

A success toast is not needed when navigation or a UI change already clearly confirms the result — e.g. going to an order-success page with a specific heading. Avoid showing both a success page and a toast with the same message.

### Use an error toast when

- A user-initiated mutation/action fails and there is no natural inline region for it.
- The failure happens after a dialog closes/navigation occurs, or affects a global action.

Do not rely on an error toast alone for:

- The first query failure: use an inline error state + retry.
- Field/form validation: show it next to the field or in a form summary.
- A permission block tied to a whole page: use a forbidden state.
- A fatal render error: use an error boundary.

### Info/warning toast

- `info`: a neutral event, clipboard/copy, or a background action completing when no other UI shows it.
- `warning`: a partially completed action, something about to expire, a conflict that can still proceed, or a state that needs attention.
- Do not use a warning toast as a substitute for a confirm dialog before a destructive action.

## Message content

- Keep messages short and state the outcome with a verb and an object: "Inventory updated", "Could not delete product".
- Success uses past tense/outcome; pending stays on the control — do not create a "Processing…" toast for a short request.
- An error message tells the user what they can do next, if anything: "Could not load the order. Please try again."
- Never show a raw stack trace, status text, exception name, endpoint, SQL, token, or `error.details`.
- Show `ApiError.message` only when the contract confirms it is safe for the user; always have a locale fallback.
- UI messages must go through `next-intl` in Storefront or `react-i18next` in Admin/CMS. Do not add a new hard-coded message to a hook/component that already uses i18n.
- Do not write in all caps, avoid stacked exclamation marks, and keep technical jargon to a minimum.
- A description should only add useful context, not repeat the title.
- Action labels are specific ("Retry", "Undo", "View cart"), not "OK" when a clearer action exists.

## Dedupe and frequency

- Never fire multiple toasts for the same failure across layers.
- For an action that can be triggered rapidly, or a repeating event, use a toast ID/dismiss/update if the notification API supports it; do not queue up identical messages.
- Multi-field validation does not create one toast per error.
- A bulk operation fires one summary toast ("8/10 products updated"), not 10 individual toasts.
- When a retry succeeds after an error, only fire a success toast if the action would normally need success feedback; a "reconnected" toast is not mandatory for every query.

## Accessibility and UX

- A loading spinner has `role="status"`/an accessible label; extra status text can use `sr-only` to avoid layout shift.
- An asynchronously updated region uses `aria-busy` where the semantics fit; do not put `aria-live` on a large, constantly-changing container.
- An important inline error uses `role="alert"`; toast is never the only way to convey an error that would cause data loss.
- Focus does not jump into the toast automatically. After a form error, focus the first invalid field or a form summary when appropriate.
- A toast with an action must be usable by keyboard and have a self-sufficient label.
- The toast's display duration must not be the only place users can read information they need to reference later.

## Reference patterns

```tsx
const updateProfile = useApiMutation({
  mutationFn: updateProfileEndpoint,
  successMessage: t('profile.updateSuccess'),
  errorFallback: t('profile.updateError'),
});

<Button type="submit" loading={updateProfile.isPending} disabled={updateProfile.isPending} aria-busy={updateProfile.isPending}>
  {updateProfile.isPending ? t('actions.saving') : t('actions.save')}
</Button>;
```

```tsx
<QueryState
  isLoading={query.isLoading}
  error={query.error}
  onRetry={() => {
    void query.refetch();
  }}
  loadingFallback={<ProductDetailSkeleton />}
>
  <ProductDetail product={query.data} />
</QueryState>
```

## Forbidden patterns

- A full-page spinner for a small mutation.
- A loading toast for every short request.
- An error toast fired from the QueryClient, the hook, and the component at the same time.
- `finally(() => setLoading(false))` running alongside `mutation.isPending`.
- Keeping a button enabled during a mutation and relying on the backend to prevent a double submit.
- Replacing stale content with a spinner during a background refetch.
- A raw `error.message` with no type/fallback/i18n.
- Hard-coding a new loading/toast string in a feature that already uses the translation catalog.
- `setTimeout` used to fake loading or hide flicker without a shared helper/policy.

## Required tests

- Initial loading shows the correct skeleton/spinner and does not show empty/error/success at the same time.
- A pending mutation disables the correct action, shows a pending label, and cannot be submitted twice.
- Success fires exactly one toast when the policy requires it.
- Failure fires exactly one toast or an inline error, not both, if they'd carry the same message.
- A query error shows retry, and retry calls the correct callback.
- A background refetch keeps the stale content, if that is the contract.
- Messages come from i18n, and the error fallback never leaks a raw transport detail.
