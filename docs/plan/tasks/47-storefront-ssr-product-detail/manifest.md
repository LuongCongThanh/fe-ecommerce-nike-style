# Manifest phạm vi — SSR product detail và related products

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng owner đích trong mapping. Đây không phải approved.files hay quyền sửa mọi file. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

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

## Consumer trực tiếp hiện tại ngoài owner

- `src/app/[locale]/(shop)/products/[slug]/page.tsx`

## Config/docs cần đối chiếu

- `playwright.production.config.ts`
- `docs/architecture.md` và tài liệu owner tương ứng ở spec; chỉ cập nhật hiện trạng đã triển khai.

## Test cũ được thích ứng trong scope

- `src/features/catalog/product-detail/components/ProductDetailTabs.test.tsx`
- `src/features/catalog/product-detail/variantColor.test.ts`

Các test mới đi cạnh owner hoặc e2e/production theo policy. Với consumer test khác chưa xuất hiện ở scan, bổ sung manifest/file scope trước triển khai; không thay assertion để né regression. Không công khai private stores để cứu setup test.
