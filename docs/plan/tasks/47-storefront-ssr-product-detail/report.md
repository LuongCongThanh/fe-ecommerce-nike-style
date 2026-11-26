# Report 47

- **PR:** #141
- **Ngày merge:** chưa merge

## Đã làm

- `/[locale]/products/[slug]`: `prefetchProductDetail(slug)` + `HydrationBoundary` quanh `ProductDetailPageClient` (UI/URL không đổi).
- `prefetchProductDetail` (`modules/catalog/server/prefetchCatalog.ts`, cộng thêm): product theo slug (404 -> `null`), rồi related khi có product. Related lỗi không làm mất product; product lỗi bỏ key để hook tự đọc lại.
- Chính sách related dùng chung (`catalogQuery.ts`: `RELATED_LIMIT`, `buildRelatedQuery`, `selectRelated`); `useRelatedProducts` dùng lại nên key server và browser giống nhau, dữ liệu raw model không nhân đôi.
- Public entry `app:(shop)/products/[slug]/page` -> `prefetchProductDetail`; docs `architecture.md`, `api-integration.md`.

## Import path cho task khác

- `prefetchProductDetail` từ `@/modules/catalog/server/prefetchCatalog`; `buildRelatedQuery`, `selectRelated`, `RELATED_LIMIT` từ `@/modules/catalog/queries/catalogQuery`.

## Lệch so với spec và rủi ro còn lại

- Không thêm Playwright/production spec: raw HTML, production hydration, browser vi/en, full E2E — not run — user decision 2026-11-26. "Browser variant interaction" thay bằng test hook `useVariantSelection`.
- Không test render page async (boundary checker cấm mock entry catalog từ `app`); thay bằng test prefetch.
- Chưa kiểm tay `pnpm start` cho PDP.
- Page đọc product rồi related tuần tự (tối đa 2 request, timeout 5 giây mỗi request).

## Test cũ đã chạm

Không đổi `ProductDetailTabs.test.tsx`, `variantColor.test.ts`. Thêm test vào `prefetchCatalog.test.ts`, `catalogQuery.test.ts`; mới `useVariantSelection.test.ts`.

## Kiểm tra

Môi trường: nhánh `logic/47-storefront-ssr-product-detail`, Linux, pnpm, Node theo `.nvmrc`.

| Lệnh                              | Exit | Kết quả                                 |
| --------------------------------- | ---- | --------------------------------------- |
| `pnpm lint`                       | 0    | ESLint + `lint:boundaries` (0 ngoại lệ) |
| `pnpm format:check`               | 0    |                                         |
| `pnpm docs:check`                 | 0    |                                         |
| `pnpm typecheck`                  | 0    |                                         |
| `pnpm test`                       | 0    | 1268 tests                              |
| `pnpm test:coverage`              | 0    | branches 99.21, ngưỡng 50               |
| `pnpm build`                      | 0    |                                         |
| `pnpm test:e2e`                   | —    | not run — user decision 2026-11-26      |
| `playwright.production.config.ts` | —    | not run — user decision 2026-11-26      |
