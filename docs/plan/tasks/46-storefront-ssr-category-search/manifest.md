# Manifest phạm vi — SSR category và search theo URL hiện có

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng owner đích trong mapping. Đây không phải approved.files hay quyền sửa mọi file. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `src/features/catalog/category-detail/components/CategoryClient.tsx`
- `src/features/catalog/category-detail/components/CategoryPageClient.tsx`
- `src/features/catalog/queries/useCategoryTree.ts`
- `src/features/catalog/queries/useProductSearch.ts`
- `src/features/catalog/search/components/SearchClient.test.tsx`
- `src/features/catalog/search/components/SearchClient.tsx`
- `src/features/catalog/search/hooks/useHeaderSearch.ts`

## Consumer trực tiếp hiện tại ngoài owner

- `src/app/[locale]/(shop)/categories/[slug]/page.tsx`
- `src/app/[locale]/(shop)/search/page.tsx`
- `src/features/catalog/components/FilterSidebar.tsx`
- `src/features/catalog/hooks/useProductSearchListing.ts`
- `src/features/catalog/queries/useProducts.ts`
- `src/modules/home/components/SectionFeaturedCategories.tsx`
- `src/features/storefront-shell/components/DesktopMegaMenu.tsx`
- `src/features/storefront-shell/components/Header.tsx`
- `src/features/storefront-shell/components/MobileNav.tsx`

## Config/docs cần đối chiếu

- `playwright.production.config.ts`
- `docs/architecture.md` và tài liệu owner tương ứng ở spec; chỉ cập nhật hiện trạng đã triển khai.

## Test cũ được thích ứng trong scope

- `src/features/catalog/search/components/SearchClient.test.tsx`

Các test mới đi cạnh owner hoặc e2e/production theo policy. Với consumer test khác chưa xuất hiện ở scan, bổ sung manifest/file scope trước triển khai; không thay assertion để né regression. Không công khai private stores để cứu setup test.
