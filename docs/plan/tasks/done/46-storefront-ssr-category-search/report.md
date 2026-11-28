# Report 46

- **PR:** #142
- **Ngày merge:** 26/11/2026 (squash, CI xanh)
- **Trạng thái:** done

## Đã làm

- `prefetchCategoryListing(slug, searchParams)`: slug từ path (thắng `?category=`), đọc cây trước rồi mới gọi products; categories/sizes/colors cho FilterSidebar. Slug lạ hoặc cây lỗi không gọi products.
- `prefetchSearchResults(q, page)` + `parseSearchPage`: chỉ key `catalogKeys.search(q.trim(), page)`; không PLP filter/options; `q` rỗng không gọi Backend.
- `categories/[slug]/page.tsx` và `search/page.tsx`: `setRequestLocale`, prefetch, `HydrationBoundary`. UI, hook, URL không đổi, không thêm `notFound`/redirect.
- `prefetchProductsListing` dùng chung helper nội bộ (hành vi giữ nguyên).
- `check-module-boundaries.ts`: thêm `PUBLIC_ENTRIES` cho hai route; docs `architecture.md`, `api-integration.md`.

## Lệch so với spec và chưa chạy

- Không có spec production SSR/E2E: not run — user decision 2026-11-26. Production CI "Production browser (Chromium)" giữ nguyên, chưa chạy local.
- Không test render page async (boundary checker cấm mock entry catalog từ `app`); thay bằng test prefetch với fetch stub. Chưa kiểm tay `vi`/`en` và đếm request trùng.
- `SearchClient.test.tsx` không đổi.

## Rủi ro và rollback

Query phụ lỗi bị bỏ khỏi dehydrate, hook browser tự đọc lại. Rollback: bỏ prefetch/`HydrationBoundary` trong hai page.

## Kiểm tra

Môi trường: nhánh `logic/46-storefront-ssr-category-search`, Linux, pnpm.

| Lệnh                                       | Exit | Kết quả                                 |
| ------------------------------------------ | ---- | --------------------------------------- |
| `pnpm exec vitest run src/modules/catalog` | 0    | 106 tests                               |
| `pnpm lint`                                | 0    | ESLint + `lint:boundaries` (0 ngoại lệ) |
| `pnpm format:check`                        | 0    |                                         |
| `pnpm docs:check`                          | 0    |                                         |
| `pnpm typecheck`                           | 0    |                                         |
| `pnpm test`                                | 0    | 116 files, 1273 tests                   |
| `pnpm test:coverage`                       | 0    | 99.51/99.21/100/100, ngưỡng 50          |
| `pnpm build`                               | 0    |                                         |
| `pnpm test:e2e`                            | —    | not run — user decision 2026-11-26      |
| `playwright.production.config.ts`          | —    | not run — user decision 2026-11-26      |
