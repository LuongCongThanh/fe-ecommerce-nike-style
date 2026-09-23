# Rules index

These files are the enforceable coding conventions for this repository. Claude Code loads each one automatically when working on a file matching its frontmatter `paths` globs, so day-to-day tasks only pull in the rules relevant to the files being touched.

For the decision order between these rules, tooling config, and existing code, plus the pre-file/pre-completion checklists, see [`docs/agents/code-conventions.md`](../../docs/agents/code-conventions.md).

## core/ — TypeScript, React and code reuse

| File                                                            | Covers                                                         |
| --------------------------------------------------------------- | -------------------------------------------------------------- |
| [`typescript-react.md`](core/typescript-react.md)               | General TS/React naming, file naming, import order, components |
| [`typescript-strict-style.md`](core/typescript-strict-style.md) | Strict-TypeScript type design: `any`, unions, nullability, Zod |
| [`solid-patterns.md`](core/solid-patterns.md)                   | Clean Code and SOLID applied to this React/TS codebase         |
| [`imports-and-reuse.md`](core/imports-and-reuse.md)             | Import aliases, when to extract vs. keep duplicate code        |

## react/ — Rendering, loading and accessibility

| File                                                   | Covers                                                      |
| ------------------------------------------------------ | ----------------------------------------------------------- |
| [`render-performance.md`](react/render-performance.md) | Re-render control: state placement, memoization, selectors  |
| [`loading-and-toast.md`](react/loading-and-toast.md)   | Loading-state taxonomy, toast ownership, content and dedupe |
| [`ui-accessibility.md`](react/ui-accessibility.md)     | Design tokens/CVA usage and the accessibility baseline      |

## data/ — Contracts, API and localization

| File                                          | Covers                                                          |
| --------------------------------------------- | --------------------------------------------------------------- |
| [`api-data.md`](data/api-data.md)             | Component -> hook -> API SDK -> schema layering, TanStack Query |
| [`error-handling.md`](data/error-handling.md) | HTTP -> `ApiError` -> UI error flow and response mapping        |
| [`localization.md`](data/localization.md)     | next-intl (Storefront) vs react-i18next (Admin/CMS), key naming |

## apps/ — App-specific structure and architecture

| File                                                        | Covers                                                             |
| ----------------------------------------------------------- | ------------------------------------------------------------------ |
| [`frontend-architecture.md`](apps/frontend-architecture.md) | Repo-wide dependency direction and state-ownership rules           |
| [`project-structure.md`](apps/project-structure.md)         | Canonical directory trees per app/package                          |
| [`storefront.md`](apps/storefront.md)                       | Storefront-specific rules (Next.js App Router, locale, mock-first) |
| [`admin-cms.md`](apps/admin-cms.md)                         | Admin/CMS-specific rules (Vite, TanStack Router, Staff session)    |

## process/ — Git and testing

| File                                         | Covers                                                         |
| -------------------------------------------- | -------------------------------------------------------------- |
| [`git-workflow.md`](process/git-workflow.md) | Branch/commit/PR conventions, permissions, anti-AI-attribution |
| [`testing.md`](process/testing.md)           | Test layer selection, Vitest/RTL/MSW/Playwright specifics      |
