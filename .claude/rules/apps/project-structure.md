---
paths:
  - 'src/**'
  - 'e2e/**'
---

# Storefront project structure

- Keep Next.js entry points in `src/app`. Place screen UI, React hooks, queries and orchestration under the owning module in `src/features`. Create folders only when needed.
- Put business logic used across routes in `src/features`. Put generic UI in `src/shared/components` and generic helpers in `src/shared/utils` (cn lives in `src/shared/styles`, currency in `src/shared/formatting`).
- Keep HTTP endpoints, OpenAPI and transitional MSW handlers in `src/lib/api`.
- Use TanStack Query for server state, Zustand for shared client state, and the URL for filters, sorting and pagination.
- Keep `*.test.ts(x)` beside the code or flow entry it exercises. Shared Vitest setup lives in `src/testing/setup.ts`, shared render support in `src/testing/render.tsx`; Playwright specs live in `e2e`.

See [the current structure](../../../docs/architecture.md) for concrete paths.
