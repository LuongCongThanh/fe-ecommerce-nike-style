# Report 11

- **PR:** none; authorized local Wayfinder execution in current checkout, 18/11/2026.
- **Ngày merge:** not applicable; no branch/commit/push/PR/merge performed.

## Đã làm

- Delivery selection excludes all Wayfinder labels, inline or dash lists with or without indentation, and decision body Type research/prototype/grilling/task. Explicit `--task` cannot bypass exclusion. Records remain available for done/unfinished/missing blocker evaluation; ordinary task order/readiness and existing resume behavior remain intact.
- Dedicated UI schema leaves ordinary reviewer result schema unchanged. UI fails closed on blocked, need_info, malformed output or invalid evidence before review/PR. Devserver stops in finally on success and failure, while existing callClaude stop/session/provider/budget protections remain in force.
- UI `ok` requires actual checked URL on current devserver origin, positive integer viewport, nonempty checked state/actions and a fresh PNG screenshot created by browser tooling at the unique absolute path supplied in the prompt. Runtime checks exact expected path, checkout containment, no symlink in the path, regular file, PNG signature and freshness (1-second filesystem timestamp tolerance). Successful response is saved alongside the PNG as `.png.json` using exclusive creation for audit.
- Tracker/runner/roadmap describe spec status truth and current selection/evidence behavior. Accepted policy allowing PR with unfinished retro remains explicitly backlog; runtime still waits for retro-turns. Confirmed merged PR96/97/99/94 evidence does not automatically change delivery01–05 status.

## Lệch so với spec và rủi ro còn lại

Task11 is a Wayfinder execution resolved locally; CI/docs gate belongs to task15. No new CLI or retro/resume policy change. Screenshot plus structured checks is auditable evidence, not provider attestation or proof that every UI acceptance criterion was exhaustively exercised. Runtime verifies PNG signature, not full image decoding or screenshot content. Same-origin route is validated; task-specific route coverage remains a reviewer obligation from spec/plan. Actual Playwright MCP availability and real browser capture are not exercised here; unavailable tooling must return blocked. Unique screenshot/JSON artifacts remain in task directory for review and may be included in the task PR.

## Test cũ đã chạm

`tasks.test.ts` and fake-world `run.test.ts`; world UI defaults now create a screenshot fixture and full evidence, and existing major-finding fixture still reaches the shared fix loop.

## Kiểm tra

- TDD selection red: 3 newly added Wayfinder cases failed, then passed; later unindented dash label reproduced a further failure before fix.
- TDD UI red: blocked/need_info/wrong URL/missing artifact erroneously opened PR (4 failures), then passed after fail-closed implementation. Durable audit assertion also failed before JSON persistence was added.
- `pnpm exec vitest run scripts/agent-run`: 14 files, 197 tests pass. Includes success/artifact persistence, malformed/blocked/need_info/empty findings, missing artifact, wrong origin/path, stale/symlink screenshot, zero viewport, empty state/actions, cleanup, existing blocker/resume/Git/preflight/budget regressions.
- `pnpm exec tsc --noEmit -p tsconfig.scripts.json`: pass.
- Scoped Prettier on changed runner/task/docs files: pass. Root full gates are run by parent integration after subsequent tasks.

## Acceptance criteria: chạy tay

Read source/schema/prompt/docs against intended policy. Real agent-run deliberately not invoked because it would mutate Git. No live browser/UI check claimed.

## Đề xuất cho môi trường

No retro invocation in this local implementation; no inferred recommendations.
