# Plan 45: SSR public reader và danh sách sản phẩm thí điểm

Branch: `logic/45-storefront-ssr-products` (từ `dev`). Một PR. Blocker 44 `done` (PR #137).

## Mapping (manifest cũ -> đích hiện tại)

| Manifest                                                | Đích sau 38-44                                               |
| ------------------------------------------------------- | ------------------------------------------------------------ |
| `src/lib/api/endpoints/catalog.ts`, `models/catalog.ts` | `src/integrations/backend/{endpoints,models}/catalog.ts`     |
| `src/features/catalog/**`                               | `src/modules/catalog/**`                                     |
| Mới: `integrations/backend/server/catalog.ts`           | giữ nguyên + `server/http.ts`                                |
| Mới: `modules/catalog/server/prefetchCatalog.ts`        | giữ nguyên                                                   |
| Mới: `e2e/production/catalog-ssr.spec.ts`               | **không tạo** (người dùng 26/11/2026: không thêm Playwright) |

## Thiết kế

- `client/query-string.ts`: `withQueryString` thuần, tách khỏi `fetcher.ts` (axios + auth adapter) để reader server không kéo transport browser.
- `endpoints/catalog.mapper.ts`: mapper DTO -> model + `toProductListParams`, dùng chung endpoint browser và reader server. Endpoint browser giữ URL/lỗi/retry cũ.
- `server/http.ts` (`server-only`): `serverGet` = fetch tới `API_ORIGIN/api/v1`, `no-store`, `credentials: omit`, timeout 5 giây, không retry, lỗi -> `ApiError`.
- `server/catalog.ts`: 5 reader (`products`, `productBySlug`, `categoryTree`, `sizes`, `colors`).
- `modules/catalog/queries/catalogQuery.ts` (thuần, không `'use client'`): `CATALOG_PAGE_SIZE`, `CATALOG_REFERENCE_STALE_TIME`, `buildProductListQuery`, `buildSearchQuery`, `toCategoryData`, `resolveCategoryId`. Hook `useProducts/useCategoryTree/useCatalogOptions/useProductSearch` dùng lại -> key và shape giống nhau giữa server và browser.
- `modules/catalog/server/prefetchCatalog.ts`: `createCatalogPrefetcher()` (QueryClient mỗi request, chỉ dehydrate query thành công) + `prefetchProductsListing(searchParams)`.
- `catalogUrlState.toSearchParams`: Next `searchParams` -> `URLSearchParams` cho parser dùng chung.
- `products/page.tsx`: đọc `searchParams`, prefetch, `HydrationBoundary`.
- `scripts/check-module-boundaries.ts`: 3 public entry cho `app:(shop)/products/page`.

## Seams kiểm thử

Unit/HTTP-level với `fetch` stub (không MSW): reader (URL, params, no-store, credentials, timeout/network/bad body, 404), mapper, query policy, `toSearchParams`, prefetch (key/shape khớp hook, slug lạ không gọi products, tree lỗi, 5xx bỏ query, QueryClient độc lập, không cookie/Authorization, key fresh không fetch lại). Test render page async không làm được: boundary checker cấm mock entry catalog từ `app`.

## Rủi ro và rollback

- Reader dùng `API_ORIGIN` trực tiếp; build không gọi Backend (page dynamic vì đọc `searchParams`).
- Rollback: bỏ prefetch/HydrationBoundary trong `products/page.tsx`; reader và query policy vô hại.
