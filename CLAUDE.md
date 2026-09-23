@AGENTS.md

Các convention chi tiết theo phạm vi nằm trong `.claude/rules/` và được Claude Code tự động nạp khi làm việc với file phù hợp.

## Agent skills

### Issue tracker

GitHub Issues (`gh` CLI), repo `LuongCongThanh/fe-ecommerce-nike-style`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), unchanged. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context: `CONTEXT-MAP.md` at root pointing to per-app `CONTEXT.md`/`docs/adr/` under `apps/storefront`, `apps/admin`, `apps/cms`; system-wide ADRs stay in root `docs/adr/`. See `docs/agents/domain.md`.
