---
status: todo
blocked-by: []
pr:
kind: refactor
approved:
  files: []
  commands: []
retro-turns:
allow-test-changes: false
---

# Spec 23: Gỡ Sentry chưa được cấu hình

Branch: `chore/23-remove-sentry`

## Problem Statement

`@sentry/nextjs` có trong `dependencies` và `src/shared/lib/monitoring/sentry.ts` gọi `Sentry.captureException` khi `NODE_ENV=production`. Repo không có `Sentry.init`, `instrumentation.ts` hay `instrumentation-client.ts`, và không có DSN nào được cấp. Vì vậy lỗi production đi vào một SDK chưa khởi tạo và bị bỏ qua mà không báo gì, trong khi code trông như đã có giám sát lỗi.

Maintainer quyết định ngày 24/11/2026: gỡ Sentry. Khi có môi trường deploy thật, thêm lại giám sát lỗi bằng một task riêng.

## Solution

`captureError(error, context)` giữ nguyên chữ ký và nơi gọi (`src/app/[locale]/error.tsx`). Ở mọi môi trường, hàm chỉ ghi `console.error`. Gỡ dependency `@sentry/nextjs` và biến `NEXT_PUBLIC_SENTRY_DSN`.

## Phạm vi

Trong phạm vi: `src/shared/lib/monitoring/sentry.ts` (bỏ import Sentry; đổi tên file chỉ khi plan thấy cần và cập nhật import duy nhất), `package.json` và `pnpm-lock.yaml` qua `pnpm remove @sentry/nextjs`, `pnpm-workspace.yaml` (bỏ `'@sentry/cli'` khỏi `allowBuilds` nếu không còn package nào cần), `NEXT_PUBLIC_SENTRY_DSN` trong `.env.example` và schema env nếu task 22 chưa xoá.

Ngoài phạm vi: thêm dịch vụ giám sát khác, đổi UI của error boundary, logging phía server.

## Acceptance criteria

- [ ] `grep -rni "sentry" src package.json pnpm-workspace.yaml .env.example next.config.ts` chỉ còn tên file/hàm nếu plan giữ tên cũ, không còn import hay dependency.
- [ ] `pnpm why @sentry/nextjs` không thấy package.
- [ ] `src/app/[locale]/error.tsx` không đổi hoặc chỉ đổi đường dẫn import.
- [ ] Lockfile chỉ đổi qua `pnpm remove`; không sửa tay.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check`, `pnpm build` xanh.

## Ghi chú/rủi ro

- `pnpm-lock.yaml` thuộc `denyPaths`, còn `package.json` là `askPaths`. Người cần cấp `approved.files: [pnpm-lock.yaml, package.json, pnpm-workspace.yaml]` và `approved.commands: [pnpm remove @sentry/nextjs]`, hoặc làm task trong phiên tương tác.
- Nếu làm sau task 22, `.env.example` có thể đã không còn `NEXT_PUBLIC_SENTRY_DSN`; khi đó bỏ qua bước đó, không xung đột.
- Map tái cấu trúc (task 18) dự định chuyển `lib/monitoring/sentry.ts` sang `shared/monitoring/`. Ghi tên file cuối cùng vào `report.md`.

## Comments
