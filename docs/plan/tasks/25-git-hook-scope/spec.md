---
status: ready-for-agent
blocked-by: []
pr:
kind: docs
approved:
  files: []
  commands: []
retro-turns:
allow-test-changes: false
---

# Spec 25: Git hook nhẹ, để build cho CI

Branch: `chore/25-git-hook-scope`

## Problem Statement

`.husky/pre-commit` chạy `lint-staged`, `pnpm lint`, `pnpm typecheck` và `pnpm build` (`next build --webpack`) cho mọi commit. `.husky/pre-push` lại chạy `pnpm typecheck` và `pnpm build`. CI đã chạy toàn bộ các gate này trên mọi PR. Hệ quả: commit chậm cả với thay đổi chỉ có docs, và build chạy ba lần cho một thay đổi. Comment trong `lint-staged.config.mjs` ("real linting runs via `pnpm lint` in CI") cũng mâu thuẫn với hook.

Maintainer quyết định ngày 24/11/2026: pre-commit chỉ định dạng file đang stage; pre-push chạy lint và typecheck; build chỉ chạy ở CI.

## Solution

- `.husky/pre-commit`: `pnpm lint-staged`.
- `.husky/pre-push`: `pnpm lint` rồi `pnpm typecheck`.
- `.husky/commit-msg`: giữ nguyên.
- Cập nhật mọi tài liệu mô tả hook.

## Phạm vi

Trong phạm vi: `.husky/pre-commit`, `.husky/pre-push`, `CONTRIBUTING.md` (đoạn "Before every commit…"), `.claude/rules/process/git-workflow.md` (mục "Pre-commit checks": hook không còn chạy lint/typecheck/build; checklist trước commit cần chạy test liên quan và nhắc rằng build chỉ có ở CI).

Ngoài phạm vi: `.husky/commit-msg`, `lint-staged.config.mjs`, CI workflow, Stop hook của runner.

[Manifest file/consumer và quyền thích ứng test trong scope](manifest.md) ghi snapshot hiện tại. Sau blocker, dùng đường dẫn đích đã chuyển thay vì tạo lại path cũ. Snapshot không thay thế việc kiểm tra diff, PR/resume work và config hiện hành trước plan.

## Acceptance criteria

- [ ] Commit một thay đổi chỉ có docs không chạy `next build`; ghi thời gian commit trước và sau vào `report.md`.
- [ ] `git push` chạy lint và typecheck; một lỗi type cố ý (tạo trên branch nháp, không commit vào task) chặn push. Ghi output vào `report.md`.
- [ ] `grep -rn "pnpm build" CONTRIBUTING.md .claude/rules/process/git-workflow.md` không còn mô tả build trong hook.
- [ ] `pnpm docs:check` và `pnpm format:check` xanh.

## Ghi chú/rủi ro

- `.husky/**` và `.claude/**` thuộc `denyPaths`. AGENTS.md quy định `.claude/rules/process/git-workflow.md` chỉ được sửa trong phiên tương tác có người, không qua `agent-run`. Task này nên làm trong phiên tương tác.
- Đánh đổi đã chấp nhận: lỗi build chỉ phát hiện ở CI. Chạy `pnpm build` tay khi đổi `next.config.ts`, dependency hoặc route.

## Comments
