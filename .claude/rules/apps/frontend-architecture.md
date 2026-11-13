---
paths:
  - 'src/**/*.{ts,tsx}'
description: High-level dependency direction and state-ownership rules for the single-app layout.
---

# Frontend architecture

- Keep the dependency direction: app route/layout -> feature -> shared UI/utility -> API SDK and schema.
- Features must use `src/lib/api`; do not add direct `fetch`/Axios calls for application endpoints.
- Use `@/*` (mapped to `src/*`) for cross-folder imports. The repo is one app at the root; `apps/admin`, `apps/cms` and `packages/*` are legacy code awaiting deletion and must not be imported.
- Do not create barrel `index.ts` files or deep-import another module's private files.
- Use TanStack Query for server state, Zustand for shared client state, React Hook Form for forms, and the URL for shareable filter/sort/pagination state.
- Put transport validation in `src/lib/schemas` and endpoint behavior in `src/lib/api`.
- Client-side auth guards exist for UX only. The backend must enforce authorization.
- Do not hand-edit the generated `routeTree.gen.ts` file.
