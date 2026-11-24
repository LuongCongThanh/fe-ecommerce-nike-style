# GitHub Copilot Instructions

Follow the storefront repository contract in [`AGENTS.md`](../AGENTS.md). [`CLAUDE.md`](../CLAUDE.md) delegates to it; do not replace the existing product, API-boundary, localization, or UI guidance with instructions from another repository.

Use the owner documentation linked by `AGENTS.md`: `docs/agents/runner.md` and `docs/agents/issue-tracker.md` for task flow, `docs/agents/code-conventions.md` for code conventions, `docs/agents/ui-workflow.md` and `design.md` for UI work, and `docs/api-integration.md` for API integration. Check that a path exists before relying on it.

Project skills exposed to Copilot are under `.github/skills/`; their canonical sources are in `.agents/skills/`. Follow the synchronization policy in `AGENTS.md` when editing a skill. Use the existing pnpm scripts and Vitest 4.x setup; do not call backend APIs outside `src/lib/api` or treat frontend guards as server authorization.
