# Manifest phạm vi — Catalog thí điểm nguyên owner và wishlist composition

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng owner đích trong mapping. Đây không phải approved.files hay quyền sửa mọi file. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `src/features/catalog/catalogUrlState.test.ts`
- `src/features/catalog/catalogUrlState.ts`
- `src/features/catalog/category-detail/components/CategoryClient.tsx`
- `src/features/catalog/category-detail/components/CategoryPageClient.tsx`
- `src/features/catalog/categoryTree.test.ts`
- `src/features/catalog/categoryTree.ts`
- `src/features/catalog/components/CatalogProductGrid.tsx`
- `src/features/catalog/components/CategoryCard.tsx`
- `src/features/catalog/components/CategoryNav.tsx`
- `src/features/catalog/components/FilterSidebar.tsx`
- `src/features/catalog/components/PriceDisplay.test.tsx`
- `src/features/catalog/components/PriceDisplay.tsx`
- `src/features/catalog/components/ProductCard.test.tsx`
- `src/features/catalog/components/ProductCard.tsx`
- `src/features/catalog/components/ProductCarousel.tsx`
- `src/features/catalog/components/ProductSkeletons.tsx`
- `src/features/catalog/discount.test.ts`
- `src/features/catalog/discount.ts`
- `src/features/catalog/hooks/useCatalogFilterControls.ts`
- `src/features/catalog/hooks/useCatalogListing.ts`
- `src/features/catalog/hooks/useProductSearchListing.ts`
- `src/features/catalog/priceRange.test.ts`
- `src/features/catalog/priceRange.ts`
- `src/features/catalog/product-detail/components/AddToCartSection.tsx`
- `src/features/catalog/product-detail/components/MobileBuyBar.tsx`
- `src/features/catalog/product-detail/components/ProductDetailPageClient.tsx`
- `src/features/catalog/product-detail/components/ProductDetailTabs.test.tsx`
- `src/features/catalog/product-detail/components/ProductDetailTabs.tsx`
- `src/features/catalog/product-detail/components/ProductGallery.tsx`
- `src/features/catalog/product-detail/components/ProductInfoPanel.tsx`
- `src/features/catalog/product-detail/components/ProductViewer3D.tsx`
- `src/features/catalog/product-detail/components/VariantSelector.tsx`
- `src/features/catalog/product-detail/hooks/useVariantSelection.ts`
- `src/features/catalog/product-detail/queries/useProduct.ts`
- `src/features/catalog/product-detail/queries/useRelatedProducts.ts`
- `src/features/catalog/product-detail/variantColor.test.ts`
- `src/features/catalog/product-detail/variantColor.ts`
- `src/features/catalog/product-list/components/ProductsClient.tsx`
- `src/features/catalog/queries/catalogKeys.ts`
- `src/features/catalog/queries/useCatalogOptions.ts`
- `src/features/catalog/queries/useCategoryTree.ts`
- `src/features/catalog/queries/useProductSearch.ts`
- `src/features/catalog/queries/useProducts.ts`
- `src/features/catalog/schemas/filter.ts`
- `src/features/catalog/search/components/SearchClient.test.tsx`
- `src/features/catalog/search/components/SearchClient.tsx`
- `src/features/catalog/search/hooks/useHeaderSearch.ts`
- `src/features/catalog/types/badge.ts`
- `src/features/catalog/variantResolution.test.ts`
- `src/features/catalog/variantResolution.ts`
- `src/shared/lib/mock-content.ts`

## Consumer trực tiếp hiện tại ngoài owner

- `src/app/[locale]/(shop)/categories/[slug]/page.tsx`
- `src/app/[locale]/(shop)/products/[slug]/page.tsx`
- `src/app/[locale]/(shop)/products/page.tsx`
- `src/app/[locale]/(shop)/search/page.tsx`
- `src/features/home/components/SectionFeaturedCategories.tsx`
- `src/features/home/components/SectionNewArrivals.tsx`
- `src/features/storefront-shell/components/DesktopMegaMenu.tsx`
- `src/features/storefront-shell/components/Header.tsx`
- `src/features/storefront-shell/components/MobileNav.tsx`
- `src/features/wishlist/components/WishlistClient.tsx`
- `src/features/wishlist/hooks/useMoveToCart.ts`

## Config/docs cần đối chiếu

- `eslint.config.mjs`
- `docs/architecture/README.md` và tài liệu owner tương ứng ở spec; chỉ cập nhật hiện trạng đã triển khai.

## File mới dự kiến (chưa tồn tại)

- `src/layouts/catalog/CatalogWishlistAction.tsx`
- `src/layouts/catalog/CatalogWishlistAction.test.tsx`

## Test cũ được thích ứng trong scope

- `src/features/catalog/catalogUrlState.test.ts`
- `src/features/catalog/categoryTree.test.ts`
- `src/features/catalog/components/PriceDisplay.test.tsx`
- `src/features/catalog/components/ProductCard.test.tsx`
- `src/features/catalog/discount.test.ts`
- `src/features/catalog/priceRange.test.ts`
- `src/features/catalog/product-detail/components/ProductDetailTabs.test.tsx`
- `src/features/catalog/product-detail/variantColor.test.ts`
- `src/features/catalog/search/components/SearchClient.test.tsx`
- `src/features/catalog/variantResolution.test.ts`

Các test mới đi cạnh owner hoặc e2e/production theo policy. Với consumer test khác chưa xuất hiện ở scan, bổ sung manifest/file scope trước triển khai; không thay assertion để né regression. Không công khai private stores để cứu setup test.
