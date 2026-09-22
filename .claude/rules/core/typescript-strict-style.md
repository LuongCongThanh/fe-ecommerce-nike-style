---
paths:
  - 'apps/**/*.{ts,tsx,mts,cts}'
  - 'packages/**/*.{ts,tsx,mts,cts}'
description: Deep strict-TypeScript type-design rules (no any, discriminated unions, nullability, Zod as source of truth).
---

# TypeScript strict conventions

`tsconfig`, ESLint and Prettier are the automated enforcement layer. This rule adds the type-design decisions tooling cannot fully infer. Never disable strictness just to make code compile.

## Required baseline configuration

- Keep `strict`, `noImplicitAny`, `verbatimModuleSyntax`, `noEmit` and the existing module resolution.
- Do not lower strictness in a sub-app/package or add `skip`/`exclude` just to hide source errors.
- New files use TypeScript; do not add JavaScript to runtime source in a package where `allowJs: false`.
- Do not edit generated declarations or generated routes to fix a type error; fix the source or the generator's owner instead.

## `any`, `unknown` and type assertions

- Never use explicit or implicit `any`. At an unknown boundary, use `unknown`, then parse/narrow before accessing it.
- Never use `as any`, `as unknown as T`, or chained assertions to force two incompatible types together.
- `as T` is only allowed when a runtime invariant has been proven but the compiler cannot express it; place the assertion right at the boundary and add a comment if the reason is not obvious.
- Never use the non-null assertion `value!` on API data, DOM queries, env values or lookups. Guard/parse first, or represent `null` in the type.
- Prefer `satisfies` when you need to check a shape while keeping literal inference; do not use an assertion that loses excess-property checking.
- Never use `// @ts-ignore`. `// @ts-expect-error` is only for type tests or a justified workaround, with an issue/removal condition, placed directly above the expected error line.
- Do not disable an ESLint rule at file scope. A single-line disable is allowed only when there is no safer type design, and it must explain why.

```ts
// Avoid
const payload = response as ProductResponse;

// Prefer
const payload = ProductResponseSchema.parse(response);
```

## Inference and annotations

- Let TypeScript infer the type of local variables and simple returns; do not repeat an obvious type.
- Declare return types for exported functions, complex public hook/component APIs, recursive functions, and boundaries where inference drift could silently change the API.
- Small callbacks with contextual typing do not need manual annotation.
- Do not annotate a value with a wider type that loses the literal (`const status: string = 'pending'`). Use inference, `as const`, or `satisfies`.
- Name public types after the domain; avoid repeating anonymous object types across multiple public signatures.

## `interface` vs `type`

- Use `interface` for object contracts that can be implemented/extended: props, options, adapter contracts, public object models.
- Use `type` for unions, intersections, tuples, mapped/conditional types, function types, and inferred types.
- No `I`/`T` prefix; use `Product`, `ProductCardProps`, `RequestOptions`.
- Do not create an empty interface that only extends another type; use a type alias or the original type directly.
- Avoid intersecting objects with overlapping-semantics fields. Design the contract clearly instead of letting an intersection collapse to `never`.
- Public props/options prefer `readonly`; input collections that must not be mutated use `readonly T[]` or `ReadonlyArray<T>`.

## Unions and state

- Do not use `enum`; use a string literal union or an `as const` object/array.
- Workflows/states with a finite set of cases use a discriminated union with one stable discriminator (`status`, `kind`, `type`).
- Do not represent mutually exclusive state with several independent booleans.
- A `switch` over a union must be exhaustive. A new case must fail to compile at its owner instead of silently falling into `default`.
- Use `default` only when the input is genuinely open; never to hide a union missing a case.

```ts
type QueryViewState<T> = { status: 'loading' } | { status: 'error'; message: string } | { status: 'empty' } | { status: 'success'; data: T };
```

## Nullability and optionality

- Distinguish clearly between:
  - `undefined`: not provided / not present in the shape.
  - `null`: the contract deliberately represents "no value".
  - Empty string: the input is present but has no content yet.
- Do not use optional (`?`) when a field always exists but may be `null`.
- Do not use `foo || fallback` when `0`, `false` or an empty string is a valid value; use `foo ?? fallback`.
- Lookup/index access must handle the "not found" case. Do not assert just because "the data is surely there".
- Optional chaining is not a substitute for validation; if a missing field is a contract error, parse/fail at the boundary.
- Put default values at the owner of the semantics — schema, function boundary, or component prop — not scattered as differing fallbacks across consumers.

## Type narrowing

- Narrow with `typeof`, `instanceof`, `in`, equality, a discriminant, Zod, or a runtime-verified type guard.
- A type guard must check enough invariants to conclude the type; do not write a predicate that just returns `true` or checks one weak field.
- Prefer control-flow narrowing via guard clauses over an assertion after a complex conditional chain.
- An error in `catch` is `unknown`; narrow it before reading `message`, `code`, `status`.
- Data from `JSON.parse`, storage, `postMessage`, URL payloads and the network is always `unknown` at the boundary.

## Objects and collections

- Do not mutate props, query data, store snapshots, or function input.
- Use object/array spread, `map`, `filter`, or the appropriate Immer/store action to make an immutable change.
- Do not use `Object`, `Function`, `{}` or the lowercase wrapper types (`string` is correct, `String` is not).
- Use `Record<Key, Value>` for a dictionary with a clear key set/semantics; use `Map` when the key isn't a string, or ordering/map operations are genuinely needed.
- Use a tuple only when position has clear semantics and the element count is fixed; if the call site becomes hard to read, use a named-field object instead.
- Do not use sparse arrays or `delete` an element; use `filter`/`splice` on a copy within the owner's scope.
- Sort data you do not own via `toSorted()` or a copy before `sort()`, to avoid mutating cache/props.

## Functions and callbacks

- Public functions have clear domain input/output; avoid `(...args: any[]) => any`.
- A callback returning `void` means the caller ignores the return value — not that the implementation definitely returns nothing; do not rely on this implicit return for control flow.
- A sync event handler should not return a Promise directly to a prop expecting `void` if a rejection could be dropped; wrap it and handle the error deliberately.
- Call optional callbacks with `callback?.(...)`; do not use a non-null assertion.
- Use overloads only when input/output have a relationship that a union/generic cannot express more clearly. The implementation signature is not the public contract.
- Do not default a generic to `any`; use `unknown`, a constraint, or no default.

## Generics

- A generic must express a relationship between at least two type positions, or preserve input-output information. If it appears only once, use a concrete type or `unknown` instead.
- Short generic names (`T`, `K`, `V`) are fine for small, familiar scopes; complex public abstractions use clear names (`TData`, `TVariables`, `TResponse`).
- Constraints should be the smallest that suffice (`T extends { id: string }`); do not force consumers to depend on a large model.
- Do not build a complex conditional/mapped type when an explicit domain type is easier to read and gives better error messages.
- Do not use a generic to blur different-semantics domains into one shared API.

## Async and Promises

- Do not wrap an already-Promise-returning API in a `new Promise` constructor.
- Always `await`/return/handle a Promise; no floating Promises. Use `void` only for fire-and-forget with its own error path, commented if not obvious.
- Run independent operations in parallel with `Promise.all`; run sequentially when there is a dependency, rate limit, or transaction ordering.
- Do not `await` inside a loop for independent operations unless the count is controlled; also do not run unlimited parallel operations over a large collection.
- Abort/cancel a long-running request or effect when the lifecycle requires it; do not update state after the owner has unmounted if the API does not manage this itself.
- Do not retry a non-idempotent mutation without an idempotency contract.

## Errors and `Result`

- Throw `Error`/`ApiError`; never throw a string, number, or arbitrary object.
- Expected validation/domain outcomes may use a discriminated result; unexpected failures use an exception/appropriate error boundary.
- Do not mix `null`, `false` and exceptions as three different ways to report the same kind of failure.
- When wrapping an error, preserve the cause if the runtime supports it, and do not leak sensitive data.
- A public function's failure semantics must be consistent between the real implementation and any mock/adapter.

## React TypeScript

- Name props `<Component>Props`, fields `readonly`; do not use `React.FC` just to get an implicit `children`.
- Declare `children` explicitly as `React.ReactNode` when the component actually accepts children.
- Events use a specific type (`FormEvent<HTMLFormElement>`, `ChangeEvent<HTMLInputElement>`), not `any` or a generic DOM event.
- Refs use the exact element type; do not cast a ref between incompatible elements.
- Multi-phase state uses a discriminated union; do not initialize `{}` and cast it to a complete model.
- `useState` needs an explicit generic when the initial value is `null`, an empty array, or too narrow a literal; otherwise prefer inference.
- Context defaults use `null` with a custom hook guarding usage outside the Provider; do not create a fake object just to avoid a null check.
- Polymorphic/`asChild` components must preserve the element's type, ref and semantics; do not cast props arbitrarily.

## Zod as the source of truth

- Infer transport types from Zod with `z.infer`; do not write a parallel interface with the same shape.
- The schema is the runtime source of truth for network/storage input. The TypeScript type does not replace runtime validation.
- A form schema may differ from the transport schema if UX/nullability differs; a mapper is responsible for the explicit conversion.
- Do not use `.passthrough()` or a broad `z.unknown()` when the contract can be described more precisely.
- Validate env once in a config module; consumers use the already-typed config instead of reading `process.env` in scattered places.

## Exports and module boundaries

- Prefer named exports; default exports only when the framework/file convention requires it.
- Export types with `export type`; import them with `import type` to keep the runtime graph clean.
- Do not re-export a private implementation or create a new barrel.
- A package's public API is only its explicit `package.json#exports`; consumers do not import a source path.
- Changing a public type must account for every consumer and be treated as a contract change.

## Forbidden patterns

```ts
let value: any;
const product = payload as Product;
const id = product!.id;
const result = data as unknown as Result;
// @ts-ignore
enum OrderStatus {}
function run(enabled: boolean, silent: boolean) {}
throw 'failed';
```

Exceptions from an untyped dependency must be isolated in the smallest possible adapter/declaration, with a comment explaining why, and must never let `any` leak into domain code.

## Checklist before finishing

- No new `any`, double assertion, non-null assertion, or unexplained ignore directive.
- Every `unknown` is parsed/narrowed before use.
- Nullability and optionality correctly reflect the contract.
- Finite unions are handled exhaustively, and no invalid state is created from separate booleans.
- Input is not mutated; async operations are awaited/returned/handled.
- Public functions/components/hooks have clear, small types that do not leak private implementation.
- Transport types come from the schema; no parallel type can drift.
- `pnpm --filter <workspace> typecheck` and ESLint pass without lowering strictness.
