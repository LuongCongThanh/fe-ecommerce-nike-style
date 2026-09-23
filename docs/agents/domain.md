# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root, if it exists: it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`docs/adr/`** at the repo root: system-wide decisions. Already has at least one ADR (`0001-tailadmin-reuse-no-attribution.md`).
- Context-scoped ADRs under `apps/<app>/docs/adr/` (e.g. `apps/storefront/docs/adr/` already has three) — read the ones that touch the area you're about to work in.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

This repo is a pnpm/Turborepo monorepo (`apps/*` + `packages/*`), so it uses the **multi-context** layout — contexts are the three apps, since each is its own bounded domain context and `apps/storefront/docs/adr/` already exists as a context-scoped ADR directory:

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← system-wide decisions
└── apps/
    ├── storefront/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← storefront-specific decisions (3 ADRs already)
    ├── admin/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← admin-specific decisions
    └── cms/
        ├── CONTEXT.md
        └── docs/adr/                  ← cms-specific decisions
```

`packages/*` (`api-sdk`, `schemas`, `shared`, `ui`, ...) are shared infrastructure/contract layers, not their own bounded domain contexts — domain vocabulary that lives there (e.g. `Product`, `Order`, `Staff` in `packages/schemas`) is considered part of whichever app context uses it, and cross-cutting decisions about it belong in the root `docs/adr/`, not a per-package ADR directory.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the relevant `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0001 (`apps/storefront/docs/adr/0001-single-repo-khong-monorepo.md`), but worth reopening because…_
