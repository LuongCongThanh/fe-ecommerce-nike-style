# Report 45

- **PR:** #139
- **Ngày merge:** 26/11/2026 (squash, CI xanh)

## Đã làm

- Reader public server: `integrations/backend/server/{http,catalog}.ts` (`server-only`, fetch thẳng `API_ORIGIN/api/v1`, `no-store`, `credentials: omit`, timeout 5 giây, không retry, lỗi thành `ApiError`).
- Tách phần thuần dùng chung: `client/query-string.ts` (`withQueryString`), `endpoints/catalog.mapper.ts` (mapper + `toProductListParams`). Endpoint browser giữ URL, lỗi, retry cũ.
- Policy query dùng chung: `modules/catalog/queries/catalogQuery.ts`. Bốn hook catalog dùng lại -> key/shape server và browser giống nhau.
- Prefetch: `modules/catalog/server/prefetchCatalog.ts` (`createCatalogPrefetcher`, `prefetchProductsListing`), QueryClient mỗi request, chỉ dehydrate query thành công.
- `/[locale]/products`: đọc `searchParams`, prefetch categories/sizes/colors/products, `HydrationBoundary`. Slug category lạ hoặc tree lỗi thì không gọi products.
- `catalogUrlState.toSearchParams`; 3 public entry cho `app:(shop)/products/page` trong `check-module-boundaries.ts`; docs `api-integration.md` và `architecture.md`.

## Import path cho task 46/47/48

- Reader: `@/integrations/backend/server/catalog` (`getProductsServer`, `getProductBySlugServer`, `getCategoryTreeServer`, `getSizesServer`, `getColorsServer`).
- Mapper: `@/integrations/backend/endpoints/catalog.mapper`.
- Query policy/key: `@/modules/catalog/queries/catalogKeys`, `@/modules/catalog/queries/catalogQuery` (`buildProductListQuery`, `buildSearchQuery`, `toCategoryData`, `resolveCategoryId`, `CATALOG_PAGE_SIZE`, `CATALOG_REFERENCE_STALE_TIME`).
- Prefetch: `@/modules/catalog/server/prefetchCatalog` (`createCatalogPrefetcher()` có `categories/options/products/search/product/dehydrate`; `prefetchProductsListing`).
- URL: `toSearchParams` từ `@/modules/catalog/catalogUrlState`.
- Mỗi route/home phải thêm public entry riêng vào `PUBLIC_ENTRIES` (consumer, target, symbol).

## Lệch so với spec và rủi ro còn lại

- Không tạo `e2e/production/catalog-ssr.spec.ts`: Playwright production/E2E not run — user decision 2026-11-26. Production CI job "Production browser (Chromium)" giữ nguyên, chưa chạy local.
- Không có test render page async: boundary checker cấm `vi.mock` entry catalog từ `app`. Thay bằng test prefetch/reader và kiểm tay bên dưới.
- Kiểm tay (không phải gate): `pnpm start` + HTTP catalog harness (port 4011): `GET /vi/products?page=1` trả 200 và HTML có link sản phẩm; `?category=ghost` trả 200 không có sản phẩm. Chưa kiểm `en`, chưa đo request trùng trên browser.
- Coverage collected set không đổi (file mới không nằm trong glob coverage); test mới cho reader, mapper, policy, prefetch.

## Test cũ đã chạm

`catalogUrlState.test.ts`: thêm case `toSearchParams`, assertion cũ giữ nguyên. `categoryTree.test.ts` không đổi.

## Kiểm tra

Môi trường: nhánh `logic/45-storefront-ssr-products`, Linux, pnpm, Node theo `.nvmrc`.

| Lệnh                              | Exit | Kết quả                                 |
| --------------------------------- | ---- | --------------------------------------- |
| `pnpm lint`                       | 0    | ESLint + `lint:boundaries` (0 ngoại lệ) |
| `pnpm format:check`               | 0    |                                         |
| `pnpm docs:check`                 | 0    |                                         |
| `pnpm typecheck`                  | 0    |                                         |
| `pnpm test`                       | 0    | 116 files, 1256 tests                   |
| `pnpm test:coverage`              | 0    | 99.51/99.21/100/100, ngưỡng 50          |
| `pnpm build`                      | 0    | mọi route vẫn dynamic                   |
| `pnpm test:e2e`                   | —    | not run — user decision 2026-11-26      |
| `playwright.production.config.ts` | —    | not run — user decision 2026-11-26      |
