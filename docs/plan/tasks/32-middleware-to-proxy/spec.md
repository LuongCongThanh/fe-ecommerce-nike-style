---
status: review
blocked-by: []
pr:
kind: refactor
approved:
  files: []
  commands: []
retro-turns:
allow-test-changes: true
---

# Spec 32: Đổi `middleware.ts` sang quy ước `proxy.ts` của Next 16

Branch: `refactor/32-middleware-to-proxy`

## Problem Statement

Next 16 đổi tên quy ước file `middleware` thành `proxy`. Với Next 16.2.12, `pnpm build` in ra:

```text
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
```

`src/middleware.ts` vẫn chạy, nhưng quy ước cũ sẽ bị gỡ ở một bản Next sau. Comment trong file còn nói authorization do "Django API" enforce, trong khi Backend là `be-demo` (NestJS).

## Solution

- `src/middleware.ts` → `src/proxy.ts`, hàm export `middleware` → `proxy`. Giữ nguyên `config.matcher` và mọi nhánh logic.
- `src/middleware.test.ts` → `src/proxy.test.ts`, import `proxy` từ `@/proxy`. Không đổi assertion.
- Sửa comment "Django" thành Backend (`be-demo`); giữ nguyên ý: cookie chỉ là gợi ý cho UX, không phải authorization.
- Cập nhật mọi chỗ nhắc `middleware.ts` trong comment, docs và agent guard.

Có thể dùng codemod chính thức (`npx @next/codemod@latest middleware-to-proxy .`) rồi rà lại diff, hoặc đổi tay; `plan.md` chọn cách.

## Phạm vi

Trong phạm vi:

- `src/middleware.ts` và `src/middleware.test.ts` (đổi tên và sửa như trên).
- Comment nhắc `middleware.ts` trong `src/app/layout.tsx`, `src/app/[locale]/(shop)/checkout/layout.tsx`, `src/app/[locale]/(shop)/account/layout.tsx`, `src/testing/setup.ts` và `e2e/checkout.spec.ts`.
- `docs/research/nextjs-naming-conventions.md` (dòng 112) và mọi tài liệu khác mà `grep` tìm thấy.
- `.claude/agent-guard.json` (`askPaths`: `src/middleware.ts` → `src/proxy.ts`).
- `.claude/hooks/lib/guard.test.ts` (dòng 98: ca `ask-path` dùng `src/middleware.ts`; đổi sang `src/proxy.ts`, giữ kết quả mong đợi `ask-path`).

Ngoài phạm vi:

- Nhánh `/admin` (`ADMIN_PATTERN`, cookie `is_admin`) và các test của nó. Storefront không có route `/admin`; gỡ nhánh này là thay đổi hành vi, cần task riêng.
- Tên biến `intlMiddleware` và import `next-intl/middleware`, vì đó là API của thư viện.
- Đổi danh sách route được bảo vệ, matcher hay cách đọc cookie.

[Manifest file/consumer và quyền thích ứng test trong scope](manifest.md) ghi snapshot hiện tại. Sau blocker, dùng đường dẫn đích đã chuyển thay vì tạo lại path cũ. Snapshot không thay thế việc kiểm tra diff, PR/resume work và config hiện hành trước plan.

## Acceptance criteria

- [ ] `pnpm build` không còn dòng `The "middleware" file convention is deprecated`; output vẫn liệt kê `ƒ Proxy`. Ghi output trước và sau vào `report.md`.
- [ ] `grep -rn "middleware\.ts\|from '@/middleware'" src e2e docs .claude --exclude-dir=tasks` rỗng.
- [ ] `src/proxy.test.ts` giữ đủ 6 test như trước, chỉ đổi đường dẫn import và tên hàm; tất cả xanh.
- [ ] Chạy tay với `pnpm dev`: `/vi/checkout` khi chưa đăng nhập chuyển hướng về `/vi/login?returnUrl=...`; `/` chuyển sang locale mặc định; `/~offline` không bị chuyển hướng.
- [ ] Playwright `e2e/checkout.spec.ts` và `e2e/auth.spec.ts` xanh trên chromium.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check`, `pnpm docs:check`, `pnpm build` xanh.

## Ghi chú/rủi ro

- `.claude/**` thuộc `denyPaths` và `src/middleware.ts` là `askPaths`. Người cần cấp `approved.files: [.claude/agent-guard.json, .claude/hooks/lib/guard.test.ts, src/middleware.ts]`, hoặc làm trong phiên tương tác. Nếu không cấp quyền sửa guard, ghi việc cập nhật `askPaths` vào `report.md` để người sửa sau.
- `proxy` của Next 16 chỉ chạy trên Node.js runtime. File hiện không khai báo `runtime` và chỉ dùng API của `next/server`, nên không bị ảnh hưởng. Nếu codemod thêm hay đổi runtime, dừng và hỏi.
- `allow-test-changes: true` chỉ để đổi tên file test, đường dẫn import và tên hàm được gọi, và đổi đường dẫn ví dụ trong ca `ask-path` của `guard.test.ts`.

## Comments
