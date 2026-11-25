# Manifest phạm vi — SSR phần catalog trên home và bàn giao trạng thái cuối

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng owner đích trong mapping. Đây không phải approved.files hay quyền sửa mọi file. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `src/features/catalog/queries/catalogKeys.ts`
- `src/features/home/components/SectionFeaturedCategories.tsx`
- `src/features/home/components/SectionNewArrivals.tsx`

## Consumer trực tiếp hiện tại ngoài owner

- `src/app/[locale]/(shop)/home/page.tsx`
- `src/features/catalog/product-detail/queries/useProduct.ts`
- `src/features/catalog/product-detail/queries/useRelatedProducts.ts`
- `src/features/catalog/queries/useCatalogOptions.ts`
- `src/features/catalog/queries/useCategoryTree.ts`
- `src/features/catalog/queries/useProductSearch.ts`
- `src/features/catalog/queries/useProducts.ts`

## Config/docs cần đối chiếu

- `playwright.production.config.ts`
- `.github/workflows/ci.yml`
- `docs/architecture.md` và tài liệu owner tương ứng ở spec; chỉ cập nhật hiện trạng đã triển khai.

## Test cũ được thích ứng trong scope

- Chưa có test cũ ở owner này trong snapshot; regression mới chỉ theo risk trong spec.

Các test mới đi cạnh owner hoặc e2e/production theo policy. Với consumer test khác chưa xuất hiện ở scan, bổ sung manifest/file scope trước triển khai; không thay assertion để né regression. Không công khai private stores để cứu setup test.
