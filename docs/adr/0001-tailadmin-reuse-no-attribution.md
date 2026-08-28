---
status: accepted
---

# Admin visual redesign reuses TailAdmin Free markup/tokens without a THIRD-PARTY-NOTICES file

The admin app's dashboard, sidebar/header shell, and every list/form page were rebuilt following the
layout, spacing, and colour structure of [TailAdmin Free](https://github.com/TailAdmin/free-tailwind-dashboard-template)
(v2.3.0, MIT License, © TailAdmin) — grid proportions, card shapes, and Tailwind class patterns were
read closely from its `src/` and re-implemented as TSX against this repo's own `@repo/ui` components
and a new admin-only theme profile (see `packages/tailwind-config`).

MIT requires the original copyright/permission notice to accompany substantial reuse of the licensed
code. The project owner was told this explicitly and asked whether to add one consolidated
`THIRD-PARTY-NOTICES.md` at the repo root to satisfy it — and explicitly declined, accepting the
compliance gap. This ADR exists so a future reader (or a license audit) finds the reasoning instead of
wondering why TailAdmin-derived UI carries no attribution anywhere in the repo.
