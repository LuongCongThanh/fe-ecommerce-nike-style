---
paths:
  - 'apps/**/*.{ts,tsx}'
  - 'packages/**/*.{ts,tsx}'
description: High-level dependency direction and state-ownership rules shared by every app and package.
---

# Frontend architecture

- Keep the dependency direction: app route/layout -> feature -> shared UI/utility -> API SDK and schema.
- Features must use `@repo/api-sdk`; do not add direct `fetch`/Axios calls for application endpoints.
- Use `@/*` for internal app imports and the public `@repo/*` subpath for workspace packages.
- Do not create barrel `index.ts` files or deep-import another module's private files.
- Use TanStack Query for server state, Zustand for shared client state, React Hook Form for forms, and the URL for shareable filter/sort/pagination state.
- Put transport validation in `@repo/schemas` and endpoint behavior in `@repo/api-sdk`.
- Client-side auth guards exist for UX only. The backend must enforce authorization.
- Do not hand-edit the generated `routeTree.gen.ts` file.
