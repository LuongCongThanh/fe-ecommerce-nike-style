# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`GLOSSARY.md`** at the repo root, if it exists. Read it for the topic at hand.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in. Current ADRs: `0001-single-repo-khong-monorepo.md`, `0001-tailadmin-reuse-no-attribution.md`, `0002-headless-cms-thay-vi-tu-xay.md`, `0003-mock-first-cho-module-chua-co-backend.md`.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo: the storefront is the only app, at the repo root. There is no `GLOSSARY-MAP.md`, no `apps/*` and no per-context ADR folders.

```
/
├── GLOSSARY.md        (created lazily)
├── docs/adr/
└── src/
```

The [glossary map for the three repositories](../plan/three-repo-restructure.md#glossary-map) identifies the vocabulary sources for storefront, API, and CMS.

## Use the glossary's vocabulary

When your output names a domain concept (in a task title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR 0003 (mock-first for modules without a backend), but worth reopening because…_
