# Contributing

This repo is maintained by a solo developer, currently not open to outside contributors. This doc exists so both the maintainer and any agent working in this repo follow the same GitHub conventions instead of improvising per session.

## Branch model

Two long-lived branches:

- **`main`** — stable. Only receives merges from `dev` via a Release PR.
- **`dev`** — active integration branch, **default branch** of the repo. All feature branches merge here first.

`master` is **frozen** (kept for historical reference only; nothing merges into it anymore).

Feature branches:

```text
<type>/<issue-number>-<slug>
```

Example: `feat/9-storefront-catalog-browse`. Branch off `dev`, not `main`.

`<type>` matches the Conventional Commits type of the change (see below).

## Commits

[Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `ci:`, `perf:`, `style:`, `build:`, `revert:`), enforced by `commitlint` (`.husky/commit-msg`). See `docs/FE/FE-EXECUTION.md` §2.16 and `docs/00-core/decision-log.md` Decision #52.

**No AI/assistant co-author attribution** (e.g. `Co-Authored-By: Claude ...`) in any commit message.

## Pull requests

- PR title also follows Conventional Commits (enforced by the `Check PR title` CI job) — under squash-merge, the PR title becomes the permanent commit message on `dev`.
- Use `.github/PULL_REQUEST_TEMPLATE.md` — Summary, Test plan, Related issue (`Refs #N`), and the no-AI-attribution checklist item.
- Target `dev` for regular feature/fix work. Target `main` only for a Release PR from `dev`.
- **Merge strategy**: squash-merge for feature branches into `dev`. Regular merge (not squash) for `dev` → `main` Release PRs, so each already-squashed feature commit stays visible in `main`'s history.
- Branch protection on `main` and `dev`: CI must pass before merging. No required reviewer approval (solo dev) — CI green is the merge gate.

## CI

`.github/workflows/ci.yml` runs Lint & format, Typecheck, and Unit tests on every PR and on push to `main`/`dev`. `pr-title-lint.yml` checks the PR title format.

## Issue labels

Two independent label groups — apply one from each as relevant:

**Triage role** (see `docs/agents/triage-labels.md`): `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`.

**Type** (mirrors the Conventional Commits type list): `type:feat`, `type:fix`, `type:chore`, `type:refactor`, `type:docs`, `type:test`, `type:ci`, `type:perf`, `type:style`, `type:build`, `type:revert`.

No `priority:*` labels — issue order is already fixed by the PRD's delivery order.
