---
name: feature
description: Use when implementing a storefront feature, behavior change, or bug fix. Follow the local task workflow, preserve the Next.js/API boundaries, add focused tests, and report the exact pnpm checks run.
---

# Storefront feature workflow

1. Read `AGENTS.md` and resolve any referenced task using `docs/agents/issue-tracker.md` and the task's current spec. Follow `docs/agents/runner.md` and the repo's interaction rules; do not change task status or perform GitHub operations unless authorized.
2. Read `docs/agents/code-conventions.md` and the path-specific `.claude/rules/` relevant to the change. For UI work, follow `design.md` and `docs/agents/ui-workflow.md`.
3. Preserve the App Router, feature/shared boundaries, generated API files, two-locale behavior, and the rule that HTTP calls go through `src/integrations/backend`.
4. Add focused tests for changed behavior using the existing Vitest/Testing Library/MSW setup. Keep tests near the implementation and avoid unrelated refactors.
5. Run the narrowest relevant checks. Use the pnpm scripts in `package.json`; report exact commands and results. Do not claim browser/UI verification unless it actually ran.

Do not create a branch, commit, push, open a PR, or merge unless the user explicitly requests the relevant operation or invokes the repository's separately authorized runner.
