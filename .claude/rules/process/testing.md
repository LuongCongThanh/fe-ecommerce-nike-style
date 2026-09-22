---
paths:
  - 'apps/**/*.{ts,tsx}'
  - 'packages/**/*.{ts,tsx}'
  - '**/*.test.{ts,tsx}'
  - '**/*.spec.{ts,tsx}'
description: Full testing strategy — layer selection, naming, Vitest/RTL/MSW/Playwright specifics, anti-flake rules.
---

# Testing conventions

## Choosing the right test layer

| Needs to be tested                                                    | Preferred layer                  |
| --------------------------------------------------------------------- | -------------------------------- |
| Pure function, mapper, formatter, business rule                       | Vitest unit test                 |
| Zod schema and validation boundary                                    | Vitest unit/table-driven test    |
| Hook/store with state transitions                                     | Vitest hook/integration test     |
| Component interaction, loading/error/empty/success                    | Testing Library integration test |
| API SDK endpoint, auth refresh, envelope/error mapping                | Vitest + MSW server              |
| Routing, browser storage, hydration, service worker, chained features | Playwright E2E                   |
| A critical customer journey across multiple routes                    | Playwright E2E                   |

- Put most logic under unit/integration tests since they are fast and deterministic; reserve E2E for browser boundaries and high-value journeys.
- Do not test the same detail at every layer. Unit tests cover logic branches; E2E proves the layers are wired together through key behavior.
- A bug fix needs a regression test at the lowest layer that can reproduce the actual bug. Add E2E only when the bug only appears through integration/browser behavior.

## Test naming and location

- Unit/integration tests live near the source, per the workspace pattern:
  - Storefront/packages currently use `src/**/__tests__/<subject>.test.ts(x)`.
  - Admin/CMS accept `src/**/*.{test,spec}.ts(x)`; prefer `__tests__` next to the feature for consistency with the rest of the codebase.
  - E2E tests only live at `apps/storefront/e2e/<flow>.spec.ts`.
- Name test files after the subject/flow, not `test1`, `misc`, `all-tests`.
- `describe` names the unit/subject; `it`/`test` describes an observable behavior and condition: `rejects checkout when stock changed`, not `works correctly`.
- Test names should not contain implementation detail like internal state names or private function names, except for a unit test that targets that function directly.

## Test structure

- Follow Arrange–Act–Assert per test; separate the blocks with a blank line when it helps readability — `Arrange/Act/Assert` comments are not required.
- One test proves one main behavior/outcome. It may contain several assertions that all support that outcome.
- Test data is small, clearly intentional, and only overrides the relevant fields. Use a fixture builder when many tests need a valid baseline; do not repeat huge object literals.
- Prefer table-driven tests (`it.each`) for validation, mapping, and business matrices; case names should show meaningful input/expected values.
- Tests must be deterministic: no dependency on system clock, machine locale, timezone, randomness, real network, or test order. Fake/inject the clock and seed data when needed.
- Avoid large DOM/object snapshots. Snapshots are only for stable output that's hard to assert more clearly and where the diff is a useful review signal.

## Unit tests (TypeScript/Vitest)

- Test public behavior; do not export a private helper just to test it. If private logic is too complex, extract a pure domain function with a real responsibility.
- A pure function's tests should cover the happy path, boundary values, invalid input, and important invariants.
- Schema tests must check a valid payload, the various missing/nullable/optional combinations, numeric boundaries, and rejection of unknown values.
- State transition tests must cover valid transitions, forbidden transitions, and the state staying unchanged on failure.
- Use specific assertions: prefer `toEqual`, `toMatchObject`, `toHaveLength`, `rejects.toMatchObject`; don't just assert truthy when the shape/value matters.
- Do not re-test a third-party library's own implementation. Test the contract this project builds on top of it.
- Mock a module only at a boundary you don't control through input/adapter/MSW. Never mock the subject under test itself, or the entire dependency graph.
- Use `vi.spyOn` with a specific target and restore it after the test; do not depend on call order unless order is part of the contract.
- If a test uses fake timers, restore real timers during cleanup and flush timers/Promises deliberately.
- Never leave `test.only`, `describe.only`, `skip`, or `todo` when a task is finished. CI already forbids Playwright `only`; Vitest still needs review for it.

## Component and hook tests

- Query in this priority order:
  1. `getByRole`/`findByRole` with an accessible name.
  2. `getByLabelText` for forms.
  3. Text/placeholder when it is a real user-facing contract.
  4. `data-testid` only when no stable semantic query exists.
- Use `userEvent.setup()` and `await user.click/type/...`; use `fireEvent` only for a primitive event `user-event` cannot simulate properly.
- `getBy*` for the current sync state; `findBy*` for elements that will appear asynchronously; `queryBy*` to assert absence.
- `waitFor` should only wrap the assertion that will change; do not put an action or multiple side effects inside its callback.
- Do not assert CSS classes/DOM nesting unless that is the contract. For accessibility state, assert role, name, disabled, checked, or expanded.
- Cover loading, empty, error and success for any component that fetches data; test retry on the error state when it exists.
- Hook tests render through the minimal real provider needed; reuse a helper like `renderWithProviders` instead of building an ad hoc provider with different semantics.
- Each test creates its own QueryClient with retries disabled, and no cache leaks between tests.
- Reset Zustand/store/runtime singletons after each test; never rely on state left behind by a previous test.
- Do not test render counts unless a performance regression is genuinely part of the contract; if needed, measure with a small test harness and avoid depending on Strict Mode dev behavior.

## API SDK and MSW

- Transport tests use MSW instead of manually mocking `fetch`, to verify the real URL, method, request and response boundary.
- The MSW server uses `onUnhandledRequest: 'error'`; a request outside expectations must fail the test.
- Follow the shared setup: `beforeAll` to listen, `afterEach` to reset handlers/state, `afterAll` to close; do not let a handler override leak into another test.
- Shared fixtures must be schema-valid and have a stable ID. Tests only override the fields the scenario needs.
- Endpoint tests should cover:
  - Request method/path/query/body.
  - Response schema parsing.
  - Non-2xx mapping into an `ApiError` with the correct `status`, `code`, `message`.
  - Auth refresh/retry and concurrency, when relevant to the endpoint.
  - Abort/network/invalid-envelope cases when they are meaningful.
- Never hit the real internet/backend in unit/integration CI.
- Mock mode and real mode must share the same contract; tests must not depend on details that only exist in the fixture if production UI can't guarantee them.

## Playwright E2E

### Scope

- E2E is for critical journeys: homepage/navigation, catalog/search, PDP variants, cart, auth, checkout, account/order, and a protected shell when relevant.
- One spec represents one user flow/domain. A test should complete one user outcome, not become a mega-flow testing the whole app.
- Add E2E only for cross-layer, high-value behavior; pure validation and mappers do not belong in E2E.

### Selectors and assertions

- Prefer `getByRole`, `getByLabel`, `getByText` with stable content; use `getByTestId` only when no semantic selector can be made stable.
- Do not use CSS/XPath tied to DOM structure, Tailwind classes, or `nth()` when the item has a business name/ID.
- Use Playwright's web-first assertions, e.g. `await expect(locator).toBeVisible()`; don't read a value and assert it synchronously when an auto-waiting assertion exists.
- Wait for a specific user outcome or URL/response; never use `page.waitForTimeout`/a sleep.
- Do not use `networkidle` as the default sync mechanism for an app with polling/a service worker; wait for the locator or the response that belongs to the flow.
- Locators must be unique. If a strict-mode locator fails, fix the accessible name/test contract instead of using `.first()` to hide the ambiguity.

### Isolation and data

- Each test is independent and runnable alone, in random order, or in parallel. Never depend on a previous test creating an account/cart/order.
- Initialize storage/session/data in a fixture or an explicit setup step; never share a mutable page/context between tests.
- When writing to `localStorage`, navigate/reload deliberately and use the correct current version/schema key.
- Data/IDs must be deterministic. Do not rely on the current date, changing inventory, or list ordering unless the flow owns that data.
- Clean up created data if the backend/test mode doesn't auto-reset. Cleanup should still run when an assertion fails, when possible.
- Test credentials come from a fixture/safe env var; never hard-code a production secret.

### Cross-browser, responsive and artifacts

- The current config runs Chromium, Firefox and WebKit; a new test must not pass only thanks to a Chromium-only API.
- Check critical responsive behavior at a minimum of a representative mobile and desktop viewport when the change touches layout; the manual visual baseline remains 320/375/414/768/1440 px.
- Never blindly update a screenshot baseline. Review the image diff and confirm the change is intentional.
- On flaky/failing tests, use the existing trace, screenshot and video config before raising timeouts/retries.
- Do not raise the global timeout or retry count to hide a race condition; fix synchronization, isolation, or the product behavior instead.
- Never commit `playwright-report`, `test-results`, traces, videos, or failure screenshots outside the managed baseline.

### Page objects and helpers

- Only create a page object/fixture when selectors and behavior are reused across multiple specs. For a simple flow, a direct locator is more readable than an abstraction.
- A page object represents a user capability (`loginAsCustomer`, `addProductToCart`), not a 1:1 wrapper around every `click`/`fill`.
- Assertions belong in the spec when they are the business outcome; a helper may assert a setup invariant but must not hide the main outcome.
- Helpers must not contain sleeps, arbitrary retries, or a catch that swallows failure.

## Fighting flaky tests

- No fixed sleeps, unseeded randomness, real network calls, shared mutable state, or order-dependent assertions.
- Do not raise a timeout before identifying the root cause.
- Do not catch an assertion to let the test continue, or manually retry an entire flow.
- Animation that affects interaction must be waited for via DOM state, or disabled through the appropriate test setting — never guessed by duration.
- If a flaky test can't be fixed within scope, report the test, its frequency/symptom, and the artifact; do not silently `skip` it.

## Coverage

- Coverage is a signal, not a substitute goal for assertion quality.
- Do not write meaningless tests just to raise a percentage, or exclude a new file just to pass a threshold.
- Prioritize branch coverage for business rules, validation, error mapping, and permission/transitions.
- Storefront has a high configured threshold for the areas it collects; changes to those areas must keep the threshold with genuinely valuable behavior tests.

## Checklist for a change's tests

- The happy path and important failure/boundary cases are covered.
- Tests are at the lowest layer sufficient to prove the behavior; E2E is only for integration/browser journeys.
- Tests are independent, deterministic, and don't leak mock/cache/store/storage state.
- Selectors follow semantics/accessibility, not implementation detail.
- No sleeps, `.only`, new skips, large snapshots, or real network calls.
- Error, loading, empty, success and retry are tested when the component has those states.
- Every consumer is re-tested when shared code is extracted.
- Test names describe the behavior and give enough failure output to diagnose.

## What to run

- Run the directly affected test file(s) first:

```bash
pnpm --filter <workspace> exec vitest run <path/to/test>
pnpm --filter storefront exec playwright test <path/to/spec> --project=chromium
```

- After the focused test, run that workspace's lint, typecheck and test.
- Run `pnpm lint`, `pnpm format:check`, `pnpm typecheck` and `pnpm test` at the root before declaring a cross-workspace change complete.
- Run `pnpm build` when framework, routing, config, dependencies, or the production bundle changed.
- Run the full `pnpm test:e2e` when an important browser flow, routing, auth, storage, or E2E infrastructure changed.
- State clearly which checks were skipped and why; never describe an unrun check as passing.
