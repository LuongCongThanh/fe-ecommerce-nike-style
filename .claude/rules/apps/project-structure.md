---
paths:
  - 'apps/**'
  - 'packages/**'
description: Canonical directory trees per app/package and the decision rules for where new code belongs.
---

# Project structure conventions

## Decision principles

1. Code that serves only one route/feature: keep it inside that app and feature.
2. Code used by multiple features within the same app: move it to that app's `src/shared` or `src/core`, by responsibility.
3. Code used by two or more apps with no app-specific business rule: consider a shared package.
4. Pure UI with no knowledge of Product/Order/Customer: `packages/ui`.
5. Transport contract/validation: `packages/schemas`.
6. HTTP endpoints, runtime adapters, mock handlers: `packages/api-sdk`.
7. Do not create a shared package/folder just because it "might be reused"; it needs at least two real consumers or a clear architectural boundary.

## Storefront

```text
apps/storefront/src/
├── app/                         # Next.js route, layout, loading, error, metadata
│   └── [locale]/
│       ├── (auth)/
│       │   ├── _lib/            # private implementation of the auth route group
│       │   │   ├── api/
│       │   │   ├── components/
│       │   │   ├── hooks/
│       │   │   └── schemas/
│       │   └── <route>/
│       └── (shop)/
│           ├── _lib/            # private implementation of shop routes
│           │   ├── api/
│           │   ├── components/<domain>/
│           │   ├── constants/
│           │   ├── data/
│           │   ├── hooks/<domain>/
│           │   ├── schemas/
│           │   ├── types/
│           │   └── utils/
│           └── <route>/
├── core/                        # app-level session/runtime concerns
├── i18n/                        # next-intl configuration
├── lang/{vi,en}/                # message catalogs
└── shared/                      # code used by multiple route groups in Storefront
```

- Route folders use `kebab-case`; dynamic segments use `[param]`; route groups use `(name)`.
- Next.js file conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`) only coordinate the route; move significant UI/logic into `_lib`.
- `_lib` is the private boundary of its route group; do not import from an unrelated route group.
- Domain components live at `components/<domain>`; hooks that call query/mutation live at `hooks/<domain>`.

## Admin and CMS

```text
apps/<admin|cms>/src/
├── core/                 # app-level runtime concerns, if any
├── features/<domain>/    # UI, hooks, model and helpers private to the domain
├── i18n/                 # react-i18next initialization
├── lang/{vi,en}/         # resources by namespace
├── routes/               # TanStack Router route files, kept thin
├── shell/                # app shell/navigation/layout shared across routes
└── test/                 # shared test setup
```

- Files in `routes/` wire up a feature and route metadata; do not put the whole business/UI logic in the route file.
- Features that call APIs separate query/mutation hooks from the component; for complex screens, use a controller/view-model hook so the component only receives a render model and meaningful callbacks.
- A feature must not import another feature's private implementation. If something is genuinely shared, move the smallest possible abstraction to `shell`, an app-level shared module, or an appropriate package.
- Do not edit `routeTree.gen.ts`; the TanStack Router plugin is responsible for generating it.

## Shared packages

```text
packages/ui/src/{components,layout,hooks,lib}
packages/shared/src/{components,hooks,lib,providers,<cross-app-module>}
packages/schemas/src/<domain>/
packages/api-sdk/src/{client,endpoints,adapters,mocks,testing,env}
```

- Every public module must be declared as a subpath in `package.json#exports`.
- Do not create a root barrel `index.ts`. An `index.tsx` file is kept only when it is already an intentional public module; do not extend that pattern.
- Packages do not import from `apps/*`; `schemas` does not import `api-sdk`; `ui` does not import `shared`, schema or domain code.
- Tests live in `__tests__` near the source. Reusable transport fixtures live in `api-sdk/src/mocks`; do not embed large fixtures in component tests.
