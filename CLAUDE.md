@AGENTS.md

Các convention chi tiết theo phạm vi nằm trong `.claude/rules/` và được Claude Code tự động nạp khi làm việc với file phù hợp.

## Agent skills

### Issue tracker

Local Markdown tasks in `docs/plan/tasks/<NN>-<name>/spec.md` (frontmatter `status`, `blocked-by`, `pr`, `kind`, `approved`, `retro-turns`); no GitHub Issues. See `docs/agents/issue-tracker.md` and `docs/plan/README.md`.

### Triage labels

Roles map onto the task `status` values (`todo`, `ready-for-agent`, `in-progress`, `needs-info`, `blocked`, `ready-for-human`, `review`, `done`); no labels. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: the storefront is the one app at the repo root; ADRs live in root `docs/adr/`. `apps/admin` and `apps/cms` are legacy code awaiting deletion. See `docs/agents/domain.md`.
