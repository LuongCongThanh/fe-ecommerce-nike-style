# Plan 47: SSR product detail và related products

Branch: `logic/47-storefront-ssr-product-detail` (từ `dev`). Một PR. Blocker 45 `done` (PR #139); 46 và 48 chạy song song nên chỉ mở rộng file dùng chung theo hướng cộng thêm.

## Mapping (manifest cũ -> đích hiện tại)

| Manifest                                   | Đích                                                                              |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| `src/features/catalog/product-detail/**`   | `src/modules/catalog/product-detail/**`                                           |
| `useRelatedProducts` (hằng + query inline) | `queries/catalogQuery.ts` (`RELATED_LIMIT`, `buildRelatedQuery`, `selectRelated`) |
| Mới: `prefetchProductDetail`               | `modules/catalog/server/prefetchCatalog.ts` (cộng thêm)                           |
| Mới: `e2e/production/*`                    | **không tạo** (người dùng 26/11/2026: không thêm Playwright)                      |

## Thiết kế

- `products/[slug]/page.tsx`: `prefetchProductDetail(slug)` rồi `HydrationBoundary` quanh `ProductDetailPageClient` (không đổi UI/URL).
- `prefetchProductDetail`: `prefetcher.product(slug)` (404 -> `null`), sau đó related qua `prefetcher.products(buildRelatedQuery(categoryId))` nếu có product. Related lỗi không ảnh hưởng product; product lỗi bỏ key để hook tự đọc lại.
- Related dùng chung chính sách giữa hook và server: cùng key `catalogKeys.products({categoryId, limit: 5, sort: 'newest'})`, dữ liệu raw model không nhân đôi; hook lọc slug hiện tại và cắt 4 bằng `selectRelated`.
- Không đổi variant selection, stock, mua hàng, mapper.
- Boundary: thêm 1 public entry `app:(shop)/products/[slug]/page` -> `prefetchProductDetail`.

## Seams kiểm thử

Unit/HTTP-level với `fetch` stub: `prefetchProductDetail` (map detail, key khớp hook, related, 404 -> null và không gọi related, 5xx/network bỏ key, related lỗi giữ product); policy related; `useVariantSelection` (tương tác variant ở mức hook, thay cho browser Playwright). Test cũ `ProductDetailTabs.test.tsx`, `variantColor.test.ts` không đổi.

## Rủi ro và rollback

- Page dynamic: thêm hai request Backend tuần tự trên server (product rồi related, timeout 5 giây mỗi request).
- Rollback: bỏ prefetch/HydrationBoundary trong `products/[slug]/page.tsx`; policy related và `prefetchProductDetail` vô hại.
