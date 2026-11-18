# Plan 11

Authorized local Wayfinder execution, 18/11/2026, within task12 phase C. Sequential current checkout; no Git mutation or real runner execution.

1. Read tracker/runner contracts and existing state/preflight tests. Public test seams: `readTasks`/`selectTask` and fake-world `runAgent` orchestration (already authorized by parent implementation).
2. Red → green: exclude Wayfinder labels (inline/dash lists) and decision body Type from delivery selection, including explicit selection; retain all records for blocker lookup.
3. Red → green: dedicated UI response and auditable screenshot evidence. Fail closed before review/PR for blocked, need_info, malformed output or missing/invalid evidence. Keep server cleanup and shared budget/state behavior.
4. Exercise artifact adversaries and existing runner regressions; scripts typecheck and scoped formatting. Update current versus backlog docs and resolve this Wayfinder execution.

Risks: filesystem artifact plus structured checks cannot attest provider honesty or exhaustive UI coverage. PNG screenshot is an auditable artifact, with expected unique path, local-origin route, viewport/state/actions and freshness checks. Browser-unavailable means blocked. Retro policy remains accepted backlog; delivery01–05 status reconciliation remains human-owned. CI/gate implementation is task15, not this slice.
