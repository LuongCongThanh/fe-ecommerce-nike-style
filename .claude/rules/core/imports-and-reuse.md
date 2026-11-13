---
paths:
  - 'src/**/*.{ts,tsx}'
description: Import alias rules and the decision framework for reusing, extracting or intentionally duplicating code.
---

# Import aliases and code reuse

## Canonical aliases

| From                   | Importing                                       | How to import                                   |
| ---------------------- | ----------------------------------------------- | ----------------------------------------------- |
| Anywhere under `src/`  | A file in a different module/folder             | `@/*` mapped to `./src/*`                       |
| Anywhere under `src/`  | A file in the same module/folder                | Relative `./...`                                |
| Anywhere               | An external dependency                          | Package name (`react`, `@tanstack/react-query`) |

The storefront is a single Next.js app at the repo root; there are no workspace packages. `apps/admin`, `apps/cms` and `packages/*` are legacy code awaiting deletion: do not import from them.

Example:

```ts
import { Button } from '@/components/ui/Button';
import { getProducts } from '@/lib/api/endpoints/catalog';
import type { Product } from '@/lib/schemas/catalog/catalog';
import { ROUTES } from '@/shared/constants/routes';

import { ProductCard } from './ProductCard';
```

## Choosing an import path

1. Same folder or direct submodule: use `./` to express local cohesion.
2. Different module/folder in the same app: use `@/`; never walk up the tree with `../`.
3. Across a layer boundary (`src/components/ui`, `src/lib/api`, `src/lib/schemas`, `src/shared`): import the module that owns the symbol; do not reach into another module's private helpers.

## Forbidden imports

```ts
// Parent-relative import
import { x } from '../../../shared/x';

// Importing legacy code that is awaiting deletion
import { AdminShell } from '../../apps/admin/src/shell/AdminShell';

// A feature importing another feature's private implementation
import { internalMapper } from '@/features/orders/internal/mapper';

// A root barrel hiding the real dependency
import { Button, ProductSchema, getProducts } from '@/all';
```

- Do not import `routeTree.gen.ts`, other generated artifacts, or test helpers into production code.
- Do not use aliases to hide a circular dependency or incorrect ownership.
- Do not create new barrel `index.ts` files. Import from the file that owns the symbol.
- Use `import type` for type-only dependencies; do not turn a type import into a runtime edge.

## Import order

Groups are separated by one blank line:

1. Runtime/framework and external dependencies.
2. App alias `@/*`.
3. Relative `./*` within the same module.
4. Side-effect imports last, only when truly needed.

ESLint is the final enforcer of exact ordering. Do not add comments to disable `import-x/order`, `no-cycle` or `no-relative-parent-imports` before fixing the underlying cause.

## Search for reuse before writing new code

Before creating a new component, hook, schema, endpoint, formatter, constant or utility:

1. Use `rg` to search by domain noun, action verb, UI label and similar type names.
2. Check `src/components/ui`, `src/shared`, `src/lib/schemas` and `src/lib/api` for an existing implementation.
3. Check the app's shared modules and neighboring features.
4. If an implementation with the same semantics already exists, reuse or extend its API instead of writing a copy.
5. If two implementations with the same semantics are found within the area being changed, merge/extract the shared part in the same change when it is safe to do so.

Never copy-paste and rename variables, CSS classes or wording to create a new implementation with the same behavior.

## Where shared code belongs

| Kind of duplication                                       | Where it belongs                                         |
| --------------------------------------------------------- | -------------------------------------------------------- |
| UI primitive with no business logic                       | `src/components/ui`                                      |
| Component/hook/helper used by several features, no domain | `src/shared`                                             |
| Schema/transport type                                     | The matching domain in `src/lib/schemas`                 |
| Endpoint/API transport                                    | `src/lib/api`                                            |
| Locale config and request setup                           | `src/i18n`                                               |
| Logic used by multiple features                           | `src/shared` or `src/core`, by responsibility            |
| Logic used within one Storefront route group              | That route group's `_lib`                                |
| Logic used within one feature                             | Keep it in `features/<domain>`                           |
| Design tokens/theme                                       | `src/styles` (Tailwind entry CSS)                        |

- Move an abstraction to the smallest common scope that contains every consumer; do not jump straight to `src/shared` if it is only used in one feature today.
- Reuse the contract/behavior, not by letting a consumer import a private file.

## When to extract

Extract when two or more implementations satisfy all of these:

- Same business meaning or same UI contract.
- Same input/output and failure semantics, or can be unified without an unclear flag.
- Expected to change for the same reason.
- The shared abstraction reduces overall code and coupling.

Examples that should be extracted:

- Two places that format VND with the same rule.
- Two mutations that repeat the same logic turning `ApiError` into one message type.
- Two features using the same accessible empty/error state.
- Two endpoints redeclaring the same response schema.
- Two components with the same markup, interaction and variants, differing only in data/label passed via props.

## When to keep separate

Keep implementations separate when they look syntactically similar but differ in semantics or reason for change, for example:

- Checkout validation and profile-edit validation currently look alike but belong to different business rules.
- Order status and Campaign status currently share label/color but have independent lifecycles.
- Admin and Storefront have different UX/accessibility contracts.
- Two flows need different permission, error handling, analytics or transaction boundaries.
- Merging them would require adding several boolean flags, an ambiguous union, or custom callbacks that make the shared API harder to understand than the separate code.

When intentionally keeping a duplicate:

- Record the reason in the handoff/PR summary.
- If the reason is not obvious and the duplicate risks being "cleaned up" by mistake, add a short comment at the boundary (Vietnamese comment is fine) stating the differing business rule; do not comment every duplicated line.
- Never justify a duplicate with "might differ in the future" without naming the concrete axis of change.

## Forbidden abstractions

- Do not create catch-all `utils.ts`, `helpers.ts`, `common.ts` or `shared.ts`.
- Do not create a generic component with many boolean props just to merge two UIs with different semantics.
- Do not create a service/repository wrapper that forwards 1:1 to `src/lib/api` without adding a valuable boundary.
- Do not put one domain's business logic into `src/components/ui` or a generic shared hook.
- Do not break the dependency direction to achieve "DRY". A small, independent duplication is better than an abstraction that creates incorrect domain coupling.

## Rules for fixing duplicated code

1. Write a characterization test if the existing behavior is not already protected.
2. Identify the part that is truly the same in semantics; leave the differing part at the consumer.
3. Extract the smallest pure core or component contract.
4. Migrate each consumer to the shared abstraction.
5. Delete the old implementation and any now-unused exports.
6. Run every consumer's tests, lint, typecheck, and check for import cycles.

Do not leave a half-finished migration with both the shared helper and the old copy still in place if the current scope allows finishing safely.
