---
paths:
  - 'apps/**/*.{ts,tsx}'
  - 'packages/**/*.{ts,tsx}'
description: Clean Code and SOLID principles applied to this React/TypeScript codebase, with priority order and abstraction thresholds.
---

# Clean Code and SOLID in React/TypeScript

SOLID is a decision-making tool, not a reason to add another layer. Prefer simple, local, testable code; abstract only when there are multiple responsibilities or real consumers.

## Priority order

When principles compete, prioritize in this order:

1. Correct business rules and data safety.
2. Readability at the call site.
3. Dependency direction and testability.
4. High cohesion, low coupling.
5. Removing same-semantics duplication.
6. Performance optimization that has been measured.

Never sacrifice correctness or a clear API just to reduce line count, chase absolute DRY, or force-fit a design pattern.

## Clean functions

- One function does one thing at one level of abstraction. If a function's name needs "and", consider splitting its responsibility.
- Function names describe intent/domain outcome (`calculateOrderTotal`, `canApproveReturn`), not generic mechanics (`processData`, `handleStuff`).
- Prefer 0–2 parameters. From 3+ related parameters, use a typed options object with clear field names; do not create an options object for two simple primitives just to satisfy a formal rule.
- Do not use positional boolean arguments like `createOrder(data, true, false)`. Use named options, a mode union, or split the function by intent.
- Do not mix command and query: a function either changes state/has a side effect, or returns data. If it must do both, the name and contract must make the side effect obvious.
- Guard clauses handle invalid/terminal cases first; avoid deep nesting and `else` after `return`.
- Do not mutate input. Return a new object/array, or call the action/store API responsible for the mutation.
- Do not depend on time, randomness, browser globals, or a hidden mutable singleton inside a pure business function; pass the dependency/value in when deterministic testing is needed.
- An async function must return a Promise with a clear type at the public boundary; do not use `void` to hide a Promise except in an intentional event handler whose error is already handled.
- Do not catch an exception only to rethrow the same error. Only catch when you can recover, add useful context, translate at a boundary, or clean up.

Example:

```ts
// Avoid: ambiguous booleans, multiple responsibilities.
updateOrder(order, true, false);

// Prefer: clear intent at the call site.
approveOrderReturn({ orderId, notifyCustomer: true });
```

## Control flow

- Prefer a linear happy path with guard clauses; keep nesting to three levels or fewer.
- Name complex or repeated conditions after the domain (`canCheckout`, `isReturnWindowOpen`).
- Avoid double negatives (`!isNotAllowed`); name booleans positively and clearly.
- Use an exhaustive `switch` for a discriminated union/finite state; call an `assertNever` helper or equivalent so the compiler catches new cases.
- Do not use magic strings/numbers for domain state, routes, query keys, or meaningful limits; define a constant near its owner or schema.
- Do not nest ternaries. Use a guard clause, a mapping, or a named function/component instead.
- Do not rely on truthy/falsy when `0`, an empty string, `null` and `undefined` have different semantics; compare explicitly per the contract.

## Modules and files

- A file has one owner/main responsibility; its main export should match the file name where possible.
- Keep the public API as small as possible. Do not export a helper only for testing; test behavior through the public API or extract a genuinely meaningful pure module.
- Constants, types and helpers used in only one file stay private to that file.
- Do not create wide-scope catch-all files like `utils.ts`, `helpers.ts`, `services.ts`, `constants.ts`. Name modules after a specific capability/domain.
- Split a file when the code has an independent reason to change, needs a test/reuse boundary, or clarifies the public API; do not split every function into its own file.
- Delete dead code, unused imports/exports, expired feature flags, and comments describing old implementations. Git is where history lives.

## Data and models

- Parse `unknown` data at the boundary with Zod/type guards; use the validated type inside the domain.
- Do not reuse one type for a transport DTO, an editable form, and a view model if their semantics/nullability differ; define separate types with an explicit mapper.
- Avoid primitive obsession for values with an important invariant; a schema or a pure constructor/factory should enforce the invariant at the boundary.
- Derived values are computed from the source of truth, not stored redundantly in multiple stores/state.
- Prefer `map`, `filter`, `find`, `some`, `every` for collection operations when they express intent clearly; use a loop when you need early exit or performance and it stays readable.

## Comments and in-code documentation

- Code and text stay in English (see [`typescript-react.md`](typescript-react.md)); comments are the only place Vietnamese is allowed, and should explain "why" — an invariant, a workaround, a security constraint, or a business exception.
- Do not comment every line, keep commented-out code, or leave a TODO without an owner/context.
- A TODO must state the removal condition or issue if one exists: `TODO(#123): remove adapter after API v2 rollout`.
- Complex public contracts get a short JSDoc about semantics, failure modes and invariants; do not repeat the type signature.
- A workaround comment should point to the upstream cause/config and be isolated in the smallest possible module.

## Side effects and dependencies

- Side effects live at recognizable boundaries: event handlers, effects, mutation hooks, adapters, or endpoints.
- Pure logic is separated from side effects so it can be tested without rendering/network when reasonable.
- Do not read env vars directly in scattered places; go through a validated config module.
- Do not initialize a client/store/provider inside a feature's render. The lifecycle owner is responsible for creating and cleaning up the dependency.
- Pass dependencies through props/hook/provider/adapter when the implementation may need to change; do not use a service locator or a hidden global mutable object.

## Testability

- Hard-to-test code usually signals a wrong responsibility or dependency boundary; fix the design before adding deep mocks.
- Do not add a production code branch that only exists for tests.
- Pure business rules need table-driven tests for important boundary cases.
- Test components by output and user behavior; do not assert private state/hook implementation details.
- Adapters get a shared contract test to guarantee the mock/browser/server implementations share the same semantics when multiple implementations exist.

## S — Single Responsibility

- Route/page: read params and compose the feature.
- Presentational component: render and emit user intent; unaware of transport, query keys, or cache invalidation.
- Container/controller hook: turn query/mutation/URL state into a render model and meaningful callbacks for the view.
- Query/mutation hook: owns server-state lifecycle; does not return JSX or hold layout.
- Endpoint function: describes one request/response.
- Schema: validates one contract.
- Split a file when there are multiple independent reasons to change, not just based on line count.

Avoid:

- A component that fetches, normalizes, manages a form, decides permissions, and renders the whole page.
- `utils.ts`, `helpers.ts`, `services.ts` becoming a dumping ground for logic with no clear home.

## O — Open/Closed

- Extend a UI primitive via props/variant/composition; do not add a chain of `if`s per consumer to a shared component.
- Use a typed mapping for status -> label/variant/allowed action when the value set is closed and the compiler can check exhaustiveness.
- Use a discriminated union and an exhaustive switch for a state machine/domain transition.
- Do not build a plugin/registry abstraction for a single consumer or a single variation.

## L — Liskov Substitution

- A wrapper component must preserve the primitive's important contract: ref, disabled, keyboard behavior, ARIA and event semantics.
- Same-named props must mean the same thing. `onSubmit` should not sometimes just validate and sometimes silently navigate too.
- Adapter implementations must return the same shape/error semantics across mock, browser and server runtimes.
- Do not widen input while narrowing output against the public type; the schema and the runtime must match the declared type.

## I — Interface Segregation

- Props contain only the data/callbacks the component actually uses; do not pass the whole store/query result for a few fields.
- Separate a read model from a mutation command when a consumer does not need both.
- Public subpath exports expose a small surface; do not export internal implementation "for convenience".
- Avoid a context that holds every piece of app state; split it by lifecycle and update frequency when consumers differ.

## D — Dependency Inversion

- Features depend on the public contract (`@repo/api-sdk`, `@repo/schemas`, props/callbacks), not on an MSW fixture or the fetch implementation.
- Runtime-specific behavior goes through an existing adapter/provider; do not check the environment in scattered places inside components.
- Inject dependencies at the boundary when test/multi-runtime support is needed. Do not create an interface + factory just to wrap one stable pure function.
- Lower-level packages do not import higher-level apps; dependencies always point toward a stable contract.

## Preferred patterns

- Composition over inheritance.
- Container/hook orchestrates data + a presentational component, when splitting clearly helps testing/reuse.
- A query-key factory for a domain with list/detail/filter.
- An adapter for browser/server/mock differences.
- Schema-first boundary for `unknown` data.
- A state machine/discriminated union for a workflow with finite transitions.
- A compound component/CVA for a UI primitive with variants, only when the resulting API is simpler than many boolean props.

## Patterns to avoid

- A repository/service layer that only forwards 1:1 to `@repo/api-sdk` without adding a valuable boundary.
- A generic base component/hook with many type parameters just to make two pieces of code look similar.
- Overlapping boolean props that create invalid states (`isLoading`, `isError`, `isEmpty`, `hasData` all managed independently); use a union or a single source of state instead.
- A mutable singleton outside a managed store/runtime.
- Premature memoization (`useMemo`, `useCallback`, `memo`) without a consumer identity need or performance evidence.
- Catch-all context, god hook, god component, and circular dependencies.
- Functions with many boolean flags, "bag of anything" object parameters, and types with too many optional fields that create invalid states.
- `as unknown as`, mass non-null assertions, or `eslint-disable` used to bypass a design/type issue.
- "Manager", "Processor", "Handler", "Service" names that do not state the actual capability/domain.
- Refactoring mixed with a large behavior change without tests protecting the old behavior.

## Abstraction threshold

Only extract a shared abstraction when at least one holds:

1. There are two or more real consumers with the same semantics, not just similar syntax.
2. A boundary needs central enforcement: auth, transport, validation, accessibility, or design tokens.
3. The pure logic is complex enough to deserve an independent test.

If two consumers have different reasons to change, keep the small duplication instead of forcing a wrong shared abstraction.

## Code smells that require a second look

- A component/hook with multiple unrelated sources of state and side effects.
- A function taking too many parameters, or returning an object where most fields aren't used by any single consumer.
- The same business condition written in multiple places.
- A small change forces edits across many unrelated modules.
- A low-level module knows about routing, toast, translation, or a high-level component.
- A test needs a long chain of mocks across private modules.
- Variable/function names cannot be made clear without generic words like `data`, `process`, `manager`.
- Adding a new case requires editing a scattered `if` chain instead of one owning union/mapping.
- A shared abstraction has grown many flags/callbacks just to simulate each consumer's own behavior.

When a code smell appears within the area being changed: refactor the related part if it is protected by tests or can be changed safely. If the refactor is out of scope or risky, state the specific technical debt clearly; do not silently expand the change.

## Clean Code checklist before finishing

- Every module/function/component has one clear responsibility and owner.
- Names express domain intent at the call site.
- No same-semantics duplication within the searched scope.
- No hidden side effect, input mutation, or second source of truth.
- Dependencies point toward a stable contract, no importing "up" a layer.
- Errors and invalid states are represented clearly, not hidden behind an assertion.
- A new abstraction has a real consumer/boundary and a smaller API than the complexity it replaces.
- Tests confirm behavior and failure paths, not implementation detail.
