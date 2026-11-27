# Report 44

- **PR:** #137
- **Ngày merge:** 26/11/2026

## Đã làm

- Bỏ root cũ khỏi `eslint.boundaries.mjs` (`features/<module>`, `features/storefront-shell`) và `scripts/check-module-boundaries.ts` (`ROOTS`, regex `locate`). Không còn rule nào chấp nhận `features`, `lib/api`, `lib/schemas`, `shared/ui`, `app/_composition`.
- `COVERAGE_MANIFEST` đổi sang path hiện hành (22 file, giá trị `null`); file biến mất vẫn bị báo, file mới trong coverage mà thiếu manifest vẫn bị báo.
- Fixture của hai test boundary chuyển sang `src/modules/*`; fixture âm giữ nguyên ý nghĩa; thêm regression: root cũ không còn map vào module/layer.
- Docs hiện trạng (`AGENTS.md`, `docs/storefront/architecture.md`, rule project-structure, frontend-architecture, imports-and-reuse) khớp cây `src/modules`.
- Audit: 0 import active tới root cũ; `src/features`, `src/lib` không tồn tại; known violation/cycle rỗng.
- `shared/utils/utils.ts`: 6 export không có consumer ngoài test của nó. Giữ thành inactive exception có tên (không xóa để không mất file trong coverage scope; không cấp API mới).
- `(auth)/layout`, `account/layout`, `checkout/layout`: đã mỏng, giữ trong `app`.
- Harness production (task 34) tồn tại: `playwright.production.config.ts`, `e2e/production/{pwa,runtime}.spec.ts`, job CI `production-browser`, script `test:e2e:production`. CI của PR #137: job `Production browser (Chromium)` pass (chỉ chạy trên CI, không chạy local).

## Lệch so với spec và rủi ro còn lại

- E2E (focused, full ba engine) và production Playwright: not run, theo quyết định người dùng 26/11/2026. Không coi là pass; harness chưa được chạy trong phiên này.
- Token chưa đo.
- Không đụng SDK/generated/pin API.

## Kiểm tra

Môi trường: nhánh `refactor/44-storefront-migration-cleanup`, Linux, pnpm.

| Lệnh                                     | Exit | Kết quả                        |
| ---------------------------------------- | ---- | ------------------------------ |
| `pnpm exec vitest run scripts`           | 0    | pass                           |
| `pnpm lint` (ESLint + `lint:boundaries`) | 0    | 766 edge, 0 ngoại lệ           |
| `pnpm format:check`                      | 0    |                                |
| `pnpm docs:check`                        | 0    |                                |
| `pnpm typecheck`                         | 0    |                                |
| `pnpm test`                              | 0    | 111 files, 1228 tests          |
| `pnpm test:coverage`                     | 0    | 99.51/99.21/100/100, ngưỡng 50 |
| `pnpm build`                             | 0    |                                |
| `pnpm test:e2e`                          | —    | not run — user decision        |
| `playwright.production.config.ts`        | —    | not run — user decision        |
