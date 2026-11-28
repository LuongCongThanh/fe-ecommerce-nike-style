# Manifest phạm vi — SSR public reader và danh sách sản phẩm thí điểm

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng owner đích trong mapping. Đây không phải approved.files hay quyền sửa mọi file. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `src/features/catalog/catalogUrlState.test.ts`
- `src/features/catalog/catalogUrlState.ts`
- `src/features/catalog/hooks/useCatalogFilterControls.ts`
- `src/features/catalog/hooks/useCatalogListing.ts`
- `src/features/catalog/hooks/useProductSearchListing.ts`
- `src/features/catalog/product-list/components/ProductsClient.tsx`
- `src/features/catalog/queries/catalogKeys.ts`
- `src/features/catalog/queries/useCatalogOptions.ts`
- `src/features/catalog/queries/useCategoryTree.ts`
- `src/features/catalog/queries/useProductSearch.ts`
- `src/features/catalog/queries/useProducts.ts`
- `src/lib/api/endpoints/catalog.ts`
- `src/lib/api/models/catalog.ts`

## Consumer trực tiếp hiện tại ngoài owner

- `src/app/[locale]/(shop)/products/page.tsx`
- `src/features/catalog/category-detail/components/CategoryClient.tsx`
- `src/features/catalog/category-detail/components/CategoryPageClient.tsx`
- `src/features/catalog/categoryTree.test.ts`
- `src/features/catalog/categoryTree.ts`
- `src/features/catalog/components/CatalogProductGrid.tsx`
- `src/features/catalog/components/CategoryNav.tsx`
- `src/features/catalog/components/FilterSidebar.tsx`
- `src/features/catalog/product-detail/components/ProductDetailPageClient.tsx`
- `src/features/catalog/product-detail/components/ProductInfoPanel.tsx`
- `src/features/catalog/product-detail/hooks/useVariantSelection.ts`
- `src/features/catalog/product-detail/queries/useProduct.ts`
- `src/features/catalog/product-detail/queries/useRelatedProducts.ts`
- `src/features/catalog/search/components/SearchClient.tsx`
- `src/modules/home/components/SectionFeaturedCategories.tsx`
- `src/modules/home/components/SectionNewArrivals.tsx`
- `src/features/storefront-shell/components/DesktopMegaMenu.tsx`
- `src/features/storefront-shell/components/MobileNav.tsx`

## Config/docs cần đối chiếu

- `playwright.production.config.ts`
- `.github/workflows/ci.yml`
- `docs/architecture/README.md` và tài liệu owner tương ứng ở spec; chỉ cập nhật hiện trạng đã triển khai.

## File mới dự kiến (chưa tồn tại)

- `src/integrations/backend/server/catalog.ts`
- `src/integrations/backend/server/catalog.test.ts`
- `src/modules/catalog/server/prefetchCatalog.ts`
- `src/modules/catalog/server/prefetchCatalog.test.ts`
- `e2e/production/catalog-ssr.spec.ts`

## Test cũ được thích ứng trong scope

- `src/features/catalog/catalogUrlState.test.ts`
- `src/features/catalog/categoryTree.test.ts`

Các test mới đi cạnh owner hoặc e2e/production theo policy. Với consumer test khác chưa xuất hiện ở scan, bổ sung manifest/file scope trước triển khai; không thay assertion để né regression. Không công khai private stores để cứu setup test.
