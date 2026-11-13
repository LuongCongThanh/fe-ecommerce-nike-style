@AGENTS.md

Các convention chi tiết theo phạm vi nằm trong `.claude/rules/` và được Claude Code tự động nạp khi làm việc với file phù hợp.

## Agent skills

### Issue tracker

GitHub Issues (`gh` CLI), repo `LuongCongThanh/fe-ecommerce-nike-style`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), unchanged. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: the storefront is the one app at the repo root; ADRs live in root `docs/adr/`. `apps/admin` and `apps/cms` are legacy code awaiting deletion. See `docs/agents/domain.md`.
