# Plan 32: Đổi `middleware.ts` sang `proxy.ts`

Branch: `refactor/32-middleware-to-proxy` (từ `dev`). Một PR, không đổi hành vi, matcher hay nhánh `/admin` (task 33).

## Duyệt

Spec ở `todo`. Người dùng yêu cầu làm task 32 ngay ngày 26/11/2026 ("user request 2026-11-26"); coi đó là duyệt ready-for-agent của người, chuyển `in-progress`.

## Cách làm

Đổi tay, không dùng codemod (chỉ một file, tránh codemod đổi runtime):

- `git mv src/middleware.ts src/proxy.ts`, `middleware` → `proxy`, comment "Django" → Backend (`be-demo`).
- `git mv src/middleware.test.ts src/proxy.test.ts`: import `@/proxy`, gọi `proxy(...)`, 6 test và assertion giữ nguyên.
- Comment/doc: `src/app/layout.tsx`, `checkout/layout.tsx`, `account/layout.tsx`, `src/testing/setup.ts`, `e2e/checkout.spec.ts`, `e2e/support/session.ts`, `docs/research/nextjs-naming-conventions.md`, `docs/architecture/README.md`.
- Guard: `.claude/agent-guard.json` hiện có `askPaths: []` (không còn `src/middleware.ts`), không cần sửa. Fixture `guard.fixture.json` và ca `ask-path` trong `guard.test.ts` đổi sang `src/proxy.ts`.
- Giữ tên `intlMiddleware`, import `next-intl/middleware`, tên helper e2e `addMiddlewareLoginHint` (ngoài scope).

## Kiểm

`pnpm build` trước/sau, grep acceptance, `pnpm lint/format:check/docs:check/typecheck/test/test:coverage/build`, chạy tay `pnpm dev` + curl. Playwright: không chạy (quyết định người dùng 26/11/2026).
