# Manifest phạm vi — Nền kiểm chứng và baseline có thể tái lập

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng owner đích trong mapping. Đây không phải approved.files hay quyền sửa mọi file. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `src/app/~offline/page.tsx` — existing Serwist document fallback configured at `src/pwa/sw.ts`.
- `e2e/auth.spec.ts`
- `e2e/cart.spec.ts`
- `e2e/catalog.spec.ts`
- `e2e/checkout.spec.ts`
- `e2e/hero-3d.spec.ts`
- `e2e/home.spec.ts`
- `e2e/pdp.spec.ts`
- `e2e/providers.spec.ts`
- `e2e/search.spec.ts`

## Consumer trực tiếp hiện tại ngoài owner

- `playwright.config.ts` starts the HTTP fixture and overrides the dev server's `API_ORIGIN` and public origin URLs.
- `playwright.production.config.ts` starts the same fixture contract on a separate port and serves the production build.
- `e2e/checkout.spec.ts` seeds the supported guest-cart storage envelope and uses MSW for cart/checkout APIs; it must not use PDP purchase while disabled.

## Contract and fixture source checked

- `src/lib/api/generated/openapi.ts` — pinned `ProductListItemResponseDto`, `ProductDetailResponseDto`, category, size, color, and pagination shapes.
- `src/lib/api/endpoints/catalog.ts` — the browser-relative catalog API path and server absolute-origin behavior.
- `src/lib/api/mocks/catalog-fixtures.ts` — current commerce mock SKU/product identities used by cart and checkout tests; not imported as a catalog API oracle.
- `src/lib/api/mocks/handlers.ts` and `src/features/cart/stores/cart.store.ts` — checkout MSW boundary and versioned guest-cart storage contract.

## Config/docs cần đối chiếu

- `package.json`
- `playwright.config.ts`
- `playwright.production.config.ts`
- `vitest.config.ts`
- `src/lib/api/env/config.ts`
- `.github/workflows/ci.yml`
- `.env.example`
- `README.md`
- `docs/architecture/README.md` và tài liệu owner tương ứng ở spec; chỉ cập nhật hiện trạng đã triển khai.

## File mới đã tạo

- `e2e/support/catalog-server.ts`
- `e2e/support/catalog-fixtures.ts`
- `e2e/support/catalog-server.test.ts`
- `e2e/support/session.ts` — bước login/logout, giỏ khách và cookie hint dùng chung giữa các spec.
- `e2e/support/playwright-base.ts` — port, runner settings và server harness dùng chung cho hai config.
- `playwright.production.config.ts`
- `e2e/production/runtime.spec.ts`
- `e2e/production/pwa.spec.ts`

## Source production đổi ngoài test (ngoại lệ, người dùng đã duyệt)

- `src/lib/api/env/config.ts`, `src/app/~offline/page.tsx`, `next.config.ts`. Lý do, owner và đợt xóa ghi trong [report](report.md).

## Quy ước được cập nhật

- `.claude/rules/process/testing.md` — thêm vị trí `e2e/production/` và `e2e/support/` vào quy tắc đặt file test.

## Test cũ được thích ứng trong scope

- `e2e/auth.spec.ts`
- `e2e/cart.spec.ts`
- `e2e/catalog.spec.ts`
- `e2e/checkout.spec.ts`
- `e2e/hero-3d.spec.ts`
- `e2e/home.spec.ts`
- `e2e/pdp.spec.ts`
- `e2e/providers.spec.ts`
- `e2e/search.spec.ts`

Các test mới đi cạnh owner hoặc e2e/production theo policy. Với consumer test khác chưa xuất hiện ở scan, bổ sung manifest/file scope trước triển khai; không thay assertion để né regression. Không công khai private stores để cứu setup test.

## Test baseline coverage được người dùng duyệt bổ sung

Coverage ban đầu của tập shared hiện hành thấp hơn ngưỡng 99% dù không đổi scope. Người dùng duyệt bổ sung các test public-behavior để giữ nguyên threshold và collected file set:

- `src/shared/hooks/useLocalStorage.test.ts` — SSR initial value và quota write failure.
- `src/shared/hooks/useMediaQuery.test.ts` — listener cleanup và SSR initial state.
- `src/shared/lib/cloudinary.test.ts` — named quality và fallback khi thiếu cloud name.
- `src/shared/lib/motion.test.ts` — momentum projection và rubberband values.
- `src/shared/lib/seo.test.ts` — fallback khi thiếu tên/site URL trong environment.
- `src/shared/ui/PageLoader.test.tsx` — accessible loading status.
- `src/shared/ui/QueryState.test.tsx` — loading, error/retry/fallback và success.
- `src/shared/utils/utils.test.ts` — bỏ qua object không hợp lệ trong query values/arrays.

Các test này không đổi implementation hoặc coverage include/exclude. Một nhánh guard của `useMediaQuery` trong effect vẫn không thể thực thi bằng public server-render seam vì React không chạy effects khi SSR.
