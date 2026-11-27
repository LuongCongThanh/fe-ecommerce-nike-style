# Plan 46: SSR category và search theo URL hiện có

Branch: `logic/46-storefront-ssr-category-search` (từ `dev`). Một PR. Blocker 45 `done` (PR #139).

## Mapping (manifest cũ -> đích hiện tại)

| Manifest                                         | Đích sau 38-45                                                        |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| `src/features/catalog/**`                        | `src/modules/catalog/**`                                              |
| `app/.../categories/[slug]/page.tsx`             | đọc `searchParams`, `prefetchCategoryListing`, `HydrationBoundary`    |
| `app/.../search/page.tsx`                        | `prefetchSearchResults(q, page)`, `HydrationBoundary`                 |
| `server/prefetchCatalog.ts` (thêm, không đổi cũ) | `prefetchCategoryListing`, `prefetchSearchResults`, `parseSearchPage` |
| Mới: `e2e/production/*.spec.ts`                  | **không tạo** (người dùng 26/11/2026: không thêm Playwright)          |

Hook, client component, key, URL không đổi. `prefetchProductsListing` dùng chung helper nội bộ `prefetchListing`.

## Điểm dừng

- Cây trước products; slug lạ hoặc cây lỗi không gọi products. Slug path thắng `?category=`.
- Search chỉ key `search(q.trim(), page)`; không categories/sizes/colors, không filter PLP; `q` rỗng không gọi Backend.
- Query lỗi bị bỏ khỏi dehydrate, query khác vẫn giữ. Không thêm `notFound`/redirect, không đổi URL.

## Seams kiểm thử

`prefetchCatalog.test.ts` (fetch stub): thứ tự tree -> products, filter từ URL, slug thắng, slug lạ, tree lỗi, products lỗi giữ tree/options, search key/page/trim/rỗng/lỗi, `parseSearchPage`. Test render page async không làm được (boundary checker cấm mock entry catalog từ `app`).

## Rủi ro và rollback

Rollback: bỏ prefetch/`HydrationBoundary` trong hai page; hai hàm prefetch vô hại. Boundary: thêm `PUBLIC_ENTRIES` cho hai route.
