# Report 48

- **PR:** (điền khi mở)
- **Ngày merge:** (điền khi merge)

## Đã làm

- `HOME_NEW_ARRIVALS_QUERY` trong `catalogQuery.ts`; `SectionNewArrivals` dùng lại thay hằng cục bộ.
- `prefetchHome()` trong `modules/catalog/server/prefetchCatalog.ts`: cây danh mục + 5 sản phẩm mới nhất, cùng key/shape với `useCategoryTree` và section, chỉ dehydrate query thành công.
- `home/page.tsx`: `await prefetchHome()` + `HydrationBoundary`. Hero, editorial, newsletter, fixture không đổi.
- Public entry: `app:(shop)/home/page -> prefetchHome`, `home -> catalogQuery (HOME_NEW_ARRIVALS_QUERY)`.
- Test mới `prefetchHome.test.ts` (5 test): key/shape, URL, lỗi một nguồn, lỗi cả hai, không cookie/credential.
- Docs: `architecture.md`, `api-integration.md` ghi home đã SSR phần catalog.

## Trạng thái SSR tổng thể tại thời điểm merge của 48

- Đã merge: `/[locale]/products` (45) và phần catalog của home (48).
- Chờ merge, không tuyên bố: category/search (46), product detail và related (47). Cập nhật docs của chúng thuộc PR của chúng.

## Chưa chạy / lệch spec

- Production SSR Playwright, `pnpm test:e2e` ba engine, PWA regression: not run — user decision 2026-11-26. Job CI "Production browser (Chromium)" giữ nguyên, chưa kiểm local.
- Không kiểm HTML/vi-en trên production build; chỉ unit/HTTP-level. Không đo request trùng trên browser.
- Spec nói bằng chứng cả vi/en và fallback cho mọi route SSR: chưa có (không E2E).

## Rủi ro và rollback

- Home thành dynamic; mỗi read timeout 5 giây, song song. Rollback: bỏ prefetch + `HydrationBoundary` trong `home/page.tsx`.

## Kiểm tra

Nhánh `logic/48-storefront-ssr-home`, Linux, pnpm.

| Lệnh                              | Exit | Kết quả                           |
| --------------------------------- | ---- | --------------------------------- |
| `pnpm lint`                       | 0    | sau khi thêm public entry home    |
| `pnpm format:check`               | 0    |                                   |
| `pnpm docs:check`                 | 0    |                                   |
| `pnpm typecheck`                  | 0    |                                   |
| `pnpm test`                       | 0    | 117 files, 1261 tests             |
| `pnpm test:coverage`              | 0    | 99.51/99.21/100/100, ngưỡng 50    |
| `pnpm build`                      | 0    |                                   |
| `pnpm test:e2e`                   | —    | not run — user decision 2026-11-26 |
| `playwright.production.config.ts` | —    | not run — user decision 2026-11-26 |
