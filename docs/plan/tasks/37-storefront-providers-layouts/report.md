# Report 37

- **PR:** #122
- **Ngày merge:** 26/11/2026

## Đã làm

- `app/_composition/AppProviders.{tsx,test.tsx}` → `providers/`; `shared/lib/query-client.ts` → `providers/query-client.ts`; `features/storefront-shell/{components,hooks}` → `layouts/{components,hooks}` (`git mv`, lịch sử giữ). Import/`vi.mock` string cập nhật ở root layout, layout test, shop layout, Header, AppProviders.
- Bỏ exclude `src/shared/lib/query-client.ts` khỏi coverage của `vitest.config.ts` (file đã rời glob; tập collected tương đương, ngưỡng 99 giữ nguyên).
- Test mới: `providers/query-client.test.ts`, `layouts/hooks/useMergeGuestDataOnLogin.test.tsx`, `layouts/components/{Footer,MobileNav,DesktopMegaMenu,Header}.test.tsx`. Không mock module nghiệp vụ (tuân ma trận public entry): dùng hook/store công khai thật, mock endpoint `@/lib/api/endpoints/*` và `next/navigation`.
- Docs hiện trạng: `docs/architecture.md`, `design.md`. `plan.md`, `metric.md` ghi cùng lượt.

## Lệch so với spec và rủi ro còn lại

- `plan.md` viết sau bước chuyển file cơ học (spec yêu cầu trước code).
- E2E (`pnpm test:e2e`, `e2e/providers.spec.ts`) và production Playwright (`playwright.production.config.ts`): not run — skipped by user decision. Không dùng làm bằng chứng pass.
- Token chưa đo (`pnpm tokens` cần sessionId).
- Hover-intent của `DesktopMegaMenu`: test không khẳng định menu đóng sau khi click link (trong jsdom menu giữ mở vì sự kiện hover/focus bubble qua portal); hành vi nguồn không đổi.
- Test Header không kiểm badge đếm giỏ/wishlist vì cần seed store private (ma trận chặn). Đề xuất bổ sung khi task 41 có test seam.
- Không thêm ngoại lệ boundary mới; `providers:AppProviders.test → auth.store` vẫn do task 40 xóa.

## Test cũ đã chạm

`AppProviders.test.tsx` (đổi path import + vị trí), `app/layout.test.tsx` (mock string `@/providers/AppProviders`). Assertion không đổi.

## Kiểm tra

Môi trường: nhánh `refactor/37-storefront-providers-layouts`, Linux, pnpm, dev mode.

| Lệnh                                                                             | Exit | Kết quả                                 |
| -------------------------------------------------------------------------------- | ---- | --------------------------------------- |
| `pnpm exec vitest run src/providers src/layouts src/app/layout.test.tsx scripts` | 0    | pass                                    |
| `pnpm lint`                                                                      | 0    | ESLint + `lint:boundaries` sạch         |
| `pnpm format:check`                                                              | 0    |                                         |
| `pnpm docs:check`                                                                | 0    |                                         |
| `pnpm typecheck`                                                                 | 0    |                                         |
| `pnpm test`                                                                      | 0    | 105 files, 1221 tests (trước 99 / 1200) |
| `pnpm test:coverage`                                                             | 0    | repo 99.47/99.19/100/100, ngưỡng giữ 99 |
| `pnpm build`                                                                     | 0    |                                         |
| `pnpm test:e2e`                                                                  | —    | not run — skipped by user decision      |
| `playwright.production.config.ts`                                                | —    | not run — skipped by user decision      |

Coverage tập file task (stmts/branches/funcs/lines): 86.17/78.26/78.37/86.2 (yêu cầu ≥ 50% line). Lệnh ghi trong `metric.md`.

## Review

Sửa theo code review (chỉ test): `useMergeGuestDataOnLogin.test.tsx` assert cả hai merge được gọi và không có `unhandledRejection`; `DesktopMegaMenu.test.tsx` đổi tên "opens on click" thành "opens on hover" (menu chỉ mở bằng hover/focus); `Header.test.tsx` reset auth store qua `clearAuth()` trong `afterEach`. `src/providers` cố ý nằm ngoài glob `include` của coverage (tập file tương đương trước đây: `query-client.ts` đã bị exclude).

## Acceptance criteria: chạy tay

- Blocker 36 `done` (PR #120/#121). Không còn file dưới `features/storefront-shell`, `app/_composition`, `shared/lib/query-client.ts`.
- Root vẫn mount `Providers` ngoài locale layout; một Toaster/progress; guest merge ở layouts.

## Đề xuất cho môi trường
