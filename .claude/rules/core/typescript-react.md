---
paths:
  - 'apps/**/*.{ts,tsx}'
  - 'packages/**/*.{ts,tsx}'
description: General TypeScript/React naming, file-naming, import-order and component conventions.
---

# TypeScript and React conventions

## TypeScript

- All code and text — identifiers, string literals, log/error messages, JSDoc, commit-adjacent docs — is written in English. Comments are the only exception and may be written in Vietnamese.
- Follow strict mode; do not use `any`, non-null assertion or type assertion to silence errors when narrowing or validating the data is possible instead.
- Use `import type` for type-only imports; keep import order per ESLint and never import the same module twice.
- Use `interface` for extensible object contracts; use `type` for unions, mapped types, tuples, or inferred/composed types.
- Interface/type names use `PascalCase`, no `I` prefix. Props follow the `<Component>Props` pattern.
- Do not use TypeScript `enum`; use a string union or an `as const` array/object with an inferred type.
- Global constants use `SCREAMING_SNAKE_CASE`; variables and functions use `camelCase`; booleans start with `is`, `has`, `can` or `should`.
- Event props start with `on`; internal handlers start with `handle`.
- Prefer named exports. Use a default export only when the framework or file convention requires it.
- Declare explicit return types for public APIs or functions with non-obvious logic; do not add redundant annotations to local variables that are easy to infer.
- Comments may be written in Vietnamese, explaining the "why", an invariant or a risk; do not restate what the code already shows. Keep domain names and technical terms as-is (in English) if translating would distort meaning.

## File and folder naming

| Kind                   | Convention                                  | Example                |
| ---------------------- | ------------------------------------------- | ---------------------- |
| React component        | `PascalCase.tsx`                            | `ProductCard.tsx`      |
| React hook             | `useCamelCase.ts`/`.tsx`                    | `useAdminProducts.ts`  |
| Store                  | `<domain>.store.ts` or the existing pattern | `cart.store.ts`        |
| Utility/adapter/config | `camelCase.ts`                              | `catalogUrlState.ts`   |
| Aggregate domain type  | `types.ts` in the feature, or `<domain>.ts` | `types.ts`, `order.ts` |
| Unit/integration test  | `<subject>.test.ts(x)` under `__tests__`    | `catalog.test.ts`      |
| Playwright             | `<flow>.spec.ts`                            | `checkout.spec.ts`     |
| Route folder           | `kebab-case`                                | `forgot-password/`     |
| Dynamic route          | `[param]`                                   | `[slug]/`              |
| Constant               | `SCREAMING_SNAKE_CASE`                      | `ORDER_STATUS_OPTIONS` |
| Zod schema value       | `<Name>Schema`                              | `ProductSchema`        |
| Query key factory      | `<domain>Keys`                              | `adminProductKeys`     |

- A file name should reflect its main export; do not use generic names like `helpers.ts`, `common.ts`, `misc.ts` when a more specific responsibility can be named.
- A file holding only types shared within one feature can be `types.ts`; canonical transport types must live in their domain under `packages/schemas`.
- Do not bulk-rename legacy files just to match this convention; apply it to new files and rename when already touching the related boundary.

## Variable and function naming

- Use nouns for data (`product`, `orderItems`, `selectedSku`) and verbs for actions (`loadProducts`, `createOrder`, `formatPrice`).
- Collections use plural nouns; IDs get an `Id` suffix; arrays of IDs use `Ids`.
- Avoid vague abbreviations like `data1`, `tmp`, `obj`, `res`, `cb`. Short names (`i`, `e`) are fine only in very small, familiar scopes; event handlers prefer `event`.
- Functions returning a boolean start with `is`, `has`, `can` or `should`; lookup functions may use `find`; conversion functions use `to*`, `from*`, `map*` or a clear domain name.
- Async functions that call the network use domain verbs (`getProducts`, `updateOrderStatus`), not generic transport names like `callApi`.
- Internal handlers use `handle<Action>`; callback props use `on<Action>`; mutation hooks use `use<Action><Entity>`.
- Do not add `Async` to a name just because it returns a Promise; the behavior and return type already convey that.

## Imports

Group order, separated by one blank line, with ESLint deciding the order within each group:

```ts
import { useState } from 'react';
import type { FormEvent } from 'react';

import { getProducts } from '@repo/api-sdk/endpoints/catalog';
import type { Product } from '@repo/schemas/catalog';
import { Button } from '@repo/ui/button';
import { useQuery } from '@tanstack/react-query';

import { ROUTES } from '@/shared/constants/routes';

import { ProductCard } from './ProductCard';
```

- Use the public alias/subpath for cross-boundary imports; relative imports are only for files in the same module or a submodule.
- Do not use parent-relative imports (`../`); ESLint forbids them. If existing files still use the old pattern, do not spread it further — use the right alias/public subpath.
- Do not import from `@repo/<package>/src/*`, another feature's private files, or `routeTree.gen.ts`.
- Do not import the same module more than once when it could be merged while still keeping `import type` correct.
- Avoid circular dependencies; if one appears, revisit ownership or extract a pure contract/type to a lower layer.

## React

- Components and their files use `PascalCase`; hooks and their files start with `use`.
- Use function components and hooks; no class components.
- Keep state at the smallest scope. Do not put derived state in `useState`; compute it from props/query/root state.
- Do not use `useEffect` to sync data that could be computed during render, or to do work that belongs directly in an event handler.
- Do not create a new `QueryClient`, provider, or store inside a feature when the app already has one responsible for it.
- Callback props should express the behavior's meaning (`onSubmit`, `onRemove`), not UI detail (`onButtonClick`), unless the component genuinely depends on the control type.
- HTML buttons must declare the correct `type`; actions that should not submit use `type="button"`.
- Add `use client` only at the boundary that truly needs browser APIs, state, effects or event handlers; keep Server Components the default in Storefront where possible.
- Treat props as readonly; do not mutate objects/arrays received from props, query cache, or store.
- List keys must be a stable domain ID; do not use the array index if items can be added, removed, sorted or reordered.
- A controlled form value must have one source of truth. Prefer React Hook Form for multi-field/validation forms; do not hand-roll duplicate state and validation once a form is complex enough.
- Add `useMemo`/`useCallback` only when identity is a contract with a child/effect, or profiling shows a real cost; do not use them by default for every function/value.
