# Report 32

- **PR:** #148
- **Ngày merge:** 26/11/2026

## Đã làm

- `src/middleware.ts` → `src/proxy.ts` (`git mv`, export `middleware` → `proxy`); `src/middleware.test.ts` → `src/proxy.test.ts` (6 test, assertion giữ nguyên). `config.matcher`, mọi nhánh logic và nhánh `/admin` giữ nguyên (task 33).
- Comment "Django API" → Backend (`be-demo`), giữ ý: cookie chỉ là hint UX.
- Comment/doc: `src/app/layout.tsx`, `checkout/layout.tsx`, `account/layout.tsx`, `src/testing/setup.ts`, `e2e/checkout.spec.ts`, `e2e/support/session.ts`, `docs/research/nextjs-naming-conventions.md`, `docs/architecture.md`.
- Guard: ca `ask-path` trong `.claude/hooks/lib/guard.test.ts` và `guard.fixture.json` đổi sang `src/proxy.ts`. `.claude/agent-guard.json` hiện có `askPaths: []`, không còn `src/middleware.ts`, nên không sửa.
- Ghi chú duyệt: spec ở `todo`; người dùng yêu cầu làm ngay ngày 26/11/2026 ("user request 2026-11-26"), coi là duyệt ready-for-agent của người.

## Bằng chứng

`pnpm build` trước (trên `dev`):

```text
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
...
ƒ Proxy (Middleware)
```

`pnpm build` sau: không còn dòng `deprecated`; vẫn có `ƒ Proxy (Middleware)`. exit 0.

Chạy tay `next dev` (cổng 3977), `curl -D -`:

| Đường dẫn      | Kết quả                                                 |
| -------------- | ------------------------------------------------------- |
| `/vi/checkout` | `307`, `location: /vi/login?returnUrl=%2Fvi%2Fcheckout` |
| `/en/checkout` | `307`, `location: /en/login?returnUrl=%2Fen%2Fcheckout` |
| `/~offline`    | `200`, không chuyển hướng                               |
| `/`            | `307`, `location: /vi` (locale mặc định)                |

`grep -rn "middleware\.ts\|from '@/middleware'" src e2e docs .claude --exclude-dir=tasks`: rỗng.

Gate: `pnpm lint`, `format:check`, `docs:check`, `typecheck`, `test` (118 file, 1290 test), `test:coverage` (99.51/99.21/100/100), `build` đều exit 0.

## Lệch so với spec

- Playwright `e2e/checkout.spec.ts`, `e2e/auth.spec.ts`: not run, theo quyết định người dùng 26/11/2026. Không coi là pass. CI job production browser vẫn chạy.
- Không thêm test mới (đổi tên thuần túy, không đổi hành vi). Helper e2e `addMiddlewareLoginHint` giữ tên cũ (ngoài scope).
- Không dùng codemod, đổi tay.

## Test cũ đã chạm

`proxy.test.ts` chỉ đổi import, tên hàm, tên `describe`; `guard.test.ts` chỉ đổi đường dẫn ví dụ `ask-path`.
