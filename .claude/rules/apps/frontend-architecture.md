---
paths:
  - 'src/**/*.{ts,tsx}'
description: High-level dependency direction and state-ownership rules for the single-app layout.
---

# Frontend architecture

- Keep the dependency direction: app route/layout -> feature -> shared UI/utility -> API SDK and schema.
- Features must use `src/integrations/backend`; do not add direct `fetch`/Axios calls for application endpoints.
- Use `@/*` (mapped to `src/*`) for cross-folder imports. The repo is one app at the root; `apps/admin`, `apps/cms` and `packages/*` have been removed and must not be imported.
- Do not create barrel `index.ts` files or deep-import another module's private files.
- Use TanStack Query for server state, Zustand for shared client state, React Hook Form for forms, and the URL for shareable filter/sort/pagination state.
- Put transport validation in `src/integrations/backend/schemas` and endpoint behavior in `src/integrations/backend`.
- Client-side auth guards exist for UX only. The backend must enforce authorization.
- Do not hand-edit `src/integrations/backend/generated/openapi.ts`; use `pnpm gen:api`.
- Cross-module imports go through the public entry matrix only: one consumer, one owner file, named symbols. `pnpm lint:boundaries` (`scripts/check-module-boundaries.ts`) rejects private files, unlisted symbols, namespace/side-effect/dynamic imports, cross-module `vi.mock` strings, re-exports and module cycles; `eslint.boundaries.mjs` holds the layer zones.
- The old roots (`src/features`, `src/lib`, `shared/ui`, `app/_composition`) are gone and no rule accepts them. When a slice moves a file, update the checker's entries, snapshot and coverage manifest in the same change.
- A known violation is recorded as one exact edge with a reason and the delivery slice that deletes it; never widen it to a folder or a wildcard. A snapshot without a consumer fails the check and must be removed.
