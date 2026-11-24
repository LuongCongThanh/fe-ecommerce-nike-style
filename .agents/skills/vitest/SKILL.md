---
name: vitest
description: Use when adding or changing storefront unit/component tests, mocks, fixtures, coverage, or Vitest configuration. Follow this repo's installed Vitest 4.x and Testing Library setup.
---

# Vitest in the storefront

- Check `package.json`, `pnpm-lock.yaml`, the Vitest configuration, `src/testing/setup.ts`, and nearby tests before using an API or changing setup. This repository uses Vitest 4.x; do not assume APIs documented for Vitest 5.
- Keep tests near the implementation. Use the existing Testing Library render helper in `src/testing/render.tsx`, setup in `src/testing/setup.ts`, and MSW patterns where a request boundary is involved.
- Prefer observable behavior and focused assertions. Reuse fixtures/helpers and avoid adding dependencies or global setup without a concrete need.
- Run a focused file with `pnpm exec vitest run <path>`; use the declared `pnpm test` or `pnpm test:coverage` scripts for broader checks.
- When changing configuration, verify the smallest affected test first, then run the applicable `pnpm typecheck`, `pnpm lint`, and other repository gates.

Check installed-version documentation when an API's availability or behavior is uncertain. Do not copy examples from a different Vitest major version without verifying compatibility.
