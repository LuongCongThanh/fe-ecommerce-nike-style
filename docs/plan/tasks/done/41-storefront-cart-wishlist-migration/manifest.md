# Manifest phạm vi — Cart và wishlist giữ persistence và merge

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng owner đích trong mapping. Đây không phải approved.files hay quyền sửa mọi file. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `src/features/cart/components/CartClient.tsx`
- `src/features/cart/components/CartDrawer.tsx`
- `src/features/cart/components/CartSummary.tsx`
- `src/features/cart/components/CartTable.tsx`
- `src/features/cart/hooks/useCart.test.tsx`
- `src/features/cart/hooks/useCart.ts`
- `src/features/cart/stores/cart.store.ts`
- `src/features/wishlist/components/WishlistClient.test.tsx`
- `src/features/wishlist/components/WishlistClient.tsx`
- `src/features/wishlist/hooks/useMoveToCart.ts`
- `src/features/wishlist/hooks/useWishlist.test.tsx`
- `src/features/wishlist/hooks/useWishlist.ts`
- `src/features/wishlist/stores/wishlist.store.ts`

## Consumer trực tiếp hiện tại ngoài owner

- `src/app/[locale]/(shop)/cart/page.tsx`
- `src/app/[locale]/(shop)/wishlist/page.tsx`
- `src/features/catalog/components/ProductCard.test.tsx`
- `src/features/catalog/components/ProductCard.tsx`
- `src/features/checkout/components/CheckoutClient.tsx`
- `src/features/checkout/components/OrderSummary.tsx`
- `src/features/checkout/hooks/useRedirectIfCartEmpty.ts`
- `src/features/checkout/queries/useCreateOrder.ts`
- `src/features/checkout/queries/useReservation.test.tsx`
- `src/features/checkout/queries/useReservation.ts`
- `src/features/storefront-shell/components/Header.tsx`
- `src/features/storefront-shell/hooks/useMergeGuestDataOnLogin.ts`

## Config/docs cần đối chiếu

- `eslint.config.mjs`
- `docs/architecture/README.md` và tài liệu owner tương ứng ở spec; chỉ cập nhật hiện trạng đã triển khai.

## Test cũ được thích ứng trong scope

- `src/features/cart/hooks/useCart.test.tsx`
- `src/features/catalog/components/ProductCard.test.tsx`
- `src/features/checkout/queries/useReservation.test.tsx`
- `src/features/wishlist/components/WishlistClient.test.tsx`
- `src/features/wishlist/hooks/useWishlist.test.tsx`

Các test mới đi cạnh owner hoặc e2e/production theo policy. Với consumer test khác chưa xuất hiện ở scan, bổ sung manifest/file scope trước triển khai; không thay assertion để né regression. Không công khai private stores để cứu setup test.
