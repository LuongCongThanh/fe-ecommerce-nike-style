# Plan 48: SSR phần catalog trên home

Branch: `logic/48-storefront-ssr-home` (từ `dev`). Blocker thật chỉ còn 45 (`done`, PR #139); 46/47 chạy song song, không phải blocker.

## Mapping (manifest cũ -> đích hiện tại)

| Manifest                                                | Đích                                                                        |
| ------------------------------------------------------- | --------------------------------------------------------------------------- |
| `src/features/catalog/queries/catalogKeys.ts`           | `src/modules/catalog/queries/catalogKeys.ts` (không đổi key)                |
| `src/modules/home/components/SectionNewArrivals.tsx`    | dùng `HOME_NEW_ARRIVALS_QUERY` thay hằng cục bộ `NEWEST`                    |
| `src/modules/home/components/SectionFeaturedCategories` | không đổi: `useCategoryTree` đã trùng key/shape với prefetch                |
| `src/app/[locale]/(shop)/home/page.tsx`                 | `await prefetchHome()` + `HydrationBoundary`                                |
| Mới                                                     | `prefetchHome` trong `modules/catalog/server/prefetchCatalog.ts` (chỉ thêm) |

## Thiết kế

- `catalogQuery.ts`: thêm `HOME_NEW_ARRIVALS_QUERY = { sort: 'newest', limit: 5 }`. Một nguồn cho server và `SectionNewArrivals` -> cùng key `catalogKeys.products(...)`, không có cache client thứ hai.
- `prefetchHome()`: `createCatalogPrefetcher()`, đọc `categories()` và `products(HOME_NEW_ARRIVALS_QUERY)` song song, chỉ dehydrate query thành công; lỗi để section tự hiện loading/error/retry.
- Thêm public entry `app:(shop)/home/page -> catalog:server/prefetchCatalog (prefetchHome)`.
- Không đổi hero/3D, editorial, newsletter, fixture, personalization.

## Seams kiểm thử

Unit/HTTP-level với `fetch` stub, file riêng `prefetchHome.test.ts` (tránh xung đột với test 46/47): key/shape, URL `limit=5&sort=newest`, một nguồn lỗi, cả hai lỗi, không cookie/credential. Không thêm Playwright/production spec (quyết định 26/11/2026).

## Rủi ro và rollback

- Home trở thành dynamic (fetch `no-store`); backend chậm nhất 5 giây timeout mỗi read, chạy song song.
- Rollback: bỏ `prefetchHome`/`HydrationBoundary` trong `home/page.tsx`; mọi thứ còn lại vô hại.
