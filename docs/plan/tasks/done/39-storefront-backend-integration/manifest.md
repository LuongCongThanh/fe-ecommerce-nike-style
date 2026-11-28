# Manifest phạm vi — Integration Backend và generated contract chuyển đồng lượt

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng owner đích trong mapping. Đây không phải approved.files hay quyền sửa mọi file. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `src/lib/api/adapters/browser.ts`
- `src/lib/api/adapters/server.test.ts`
- `src/lib/api/adapters/server.ts`
- `src/lib/api/client/api-error.test.ts`
- `src/lib/api/client/api-error.ts`
- `src/lib/api/client/fetcher.ts`
- `src/lib/api/client/runtime.ts`
- `src/lib/api/endpoints/address.ts`
- `src/lib/api/endpoints/auth.test.ts`
- `src/lib/api/endpoints/auth.ts`
- `src/lib/api/endpoints/cart.test.ts`
- `src/lib/api/endpoints/cart.ts`
- `src/lib/api/endpoints/catalog.ts`
- `src/lib/api/endpoints/checkout.ts`
- `src/lib/api/endpoints/order-lifecycle.test.tsx`
- `src/lib/api/endpoints/order-transitions.test.ts`
- `src/lib/api/endpoints/order-transitions.ts`
- `src/lib/api/endpoints/orders.ts`
- `src/lib/api/endpoints/profile.ts`
- `src/lib/api/endpoints/wishlist.ts`
- `src/lib/api/env/config.ts`
- `src/lib/api/generated/openapi.ts`
- `src/lib/api/mocks/address-fixtures.ts`
- `src/lib/api/mocks/auth-fixtures.test.ts`
- `src/lib/api/mocks/auth-fixtures.ts`
- `src/lib/api/mocks/cart-fixtures.ts`
- `src/lib/api/mocks/catalog-fixtures.ts`
- `src/lib/api/mocks/handlers.ts`
- `src/lib/api/mocks/order-fixtures.ts`
- `src/lib/api/mocks/reservation-fixtures.ts`
- `src/lib/api/mocks/search-match.test.ts`
- `src/lib/api/mocks/search-match.ts`
- `src/lib/api/mocks/wishlist-fixtures.ts`
- `src/lib/api/models/catalog.ts`
- `src/lib/api/testing/msw-browser.ts`
- `src/lib/api/testing/msw-server.ts`
- `src/lib/schemas/address/address.ts`
- `src/lib/schemas/auth/auth.ts`
- `src/lib/schemas/cart/cart.ts`
- `src/lib/schemas/catalog/catalog.test.ts`
- `src/lib/schemas/catalog/catalog.ts`
- `src/lib/schemas/common/pagination.test.ts`
- `src/lib/schemas/common/pagination.ts`
- `src/lib/schemas/errors/envelope.test.ts`
- `src/lib/schemas/errors/envelope.ts`
- `src/lib/schemas/order/order.ts`
- `src/lib/schemas/profile/profile.ts`
- `src/lib/schemas/wishlist/wishlist.ts`
- `src/shared/lib/api-mocking.ts`
- `src/shared/types/user.ts`

## Consumer trực tiếp hiện tại ngoài owner

- `src/app/_composition/AppProviders.test.tsx`
- `src/features/account/addresses/components/AddressesClient.test.tsx`
- `src/features/account/addresses/components/AddressesClient.tsx`
- `src/features/account/addresses/queries/useAddresses.ts`
- `src/features/account/addresses/queries/useDeleteAddress.ts`
- `src/features/account/addresses/queries/useSaveAddress.ts`
- `src/features/account/addresses/queries/useSetDefaultAddress.ts`
- `src/features/account/addresses/schemas/address.ts`
- `src/features/account/profile/components/ProfileClient.test.tsx`
- `src/features/account/profile/queries/useProfile.ts`
- `src/features/account/profile/queries/useUpdateProfile.ts`
- `src/features/auth/services/auth.ts`
- `src/features/auth/session/AuthRuntimeProvider.tsx`
- `src/features/auth/session/roles.ts`
- `src/features/auth/session/useAuth.test.ts`
- `src/features/auth/session/useAuth.ts`
- `src/features/auth/stores/auth-store.test.ts`
- `src/features/auth/stores/auth.store.ts`
- `src/features/cart/hooks/useCart.test.tsx`
- `src/features/cart/hooks/useCart.ts`
- `src/features/catalog/catalogUrlState.ts`
- `src/features/catalog/category-detail/components/CategoryPageClient.tsx`
- `src/features/catalog/categoryTree.test.ts`
- `src/features/catalog/categoryTree.ts`
- `src/features/catalog/components/CatalogProductGrid.tsx`
- `src/features/catalog/components/CategoryNav.tsx`
- `src/features/catalog/priceRange.test.ts`
- `src/features/catalog/priceRange.ts`
- `src/features/catalog/product-detail/components/ProductDetailPageClient.tsx`
- `src/features/catalog/product-detail/components/ProductInfoPanel.tsx`
- `src/features/catalog/product-detail/hooks/useVariantSelection.ts`
- `src/features/catalog/product-detail/queries/useProduct.ts`
- `src/features/catalog/product-detail/queries/useRelatedProducts.ts`
- `src/features/catalog/queries/catalogKeys.ts`
- `src/features/catalog/queries/useCatalogOptions.ts`
- `src/features/catalog/queries/useCategoryTree.ts`
- `src/features/catalog/queries/useProductSearch.ts`
- `src/features/catalog/queries/useProducts.ts`
- `src/features/catalog/search/components/SearchClient.test.tsx`
- `src/features/catalog/variantResolution.test.ts`
- `src/features/catalog/variantResolution.ts`
- `src/features/checkout/components/checkout-flow.test.tsx`
- `src/features/checkout/queries/useCreateOrder.ts`
- `src/features/checkout/queries/useReservation.test.tsx`
- `src/features/checkout/queries/useReservation.ts`
- `src/features/checkout/schemas/checkout.ts`
- `src/features/home/components/SectionNewArrivals.tsx`
- `src/features/orders/components/OrderStatusBadge.tsx`
- `src/features/orders/order-detail/components/OrderDetailClient.test.tsx`
- `src/features/orders/order-detail/components/OrderDetailClient.tsx`
- `src/features/orders/order-detail/queries/useCancelOrder.ts`
- `src/features/orders/order-detail/queries/useOrder.ts`
- `src/features/orders/order-detail/queries/useRequestReturn.ts`
- `src/features/orders/order-list/components/OrdersClient.test.tsx`
- `src/features/orders/order-list/queries/useOrders.test.tsx`
- `src/features/orders/order-list/queries/useOrders.ts`
- `src/features/orders/services/order.ts`
- `src/features/wishlist/components/WishlistClient.test.tsx`
- `src/features/wishlist/hooks/useMoveToCart.ts`
- `src/features/wishlist/hooks/useWishlist.test.tsx`
- `src/features/wishlist/hooks/useWishlist.ts`
- `src/instrumentation.node.ts`
- `src/shared/lib/errors/api-error.ts`

## Config/docs cần đối chiếu

- `scripts/gen-api.mjs`
- `package.json`
- `.github/workflows/ci.yml`
- `eslint.config.mjs`
- `src/instrumentation.ts`
- `src/instrumentation.node.ts`
- `docs/architecture/README.md` và tài liệu owner tương ứng ở spec; chỉ cập nhật hiện trạng đã triển khai.

## Test cũ được thích ứng trong scope

- `src/app/_composition/AppProviders.test.tsx`
- `src/features/account/addresses/components/AddressesClient.test.tsx`
- `src/features/account/profile/components/ProfileClient.test.tsx`
- `src/features/auth/session/useAuth.test.ts`
- `src/features/auth/stores/auth-store.test.ts`
- `src/features/cart/hooks/useCart.test.tsx`
- `src/features/catalog/categoryTree.test.ts`
- `src/features/catalog/priceRange.test.ts`
- `src/features/catalog/search/components/SearchClient.test.tsx`
- `src/features/catalog/variantResolution.test.ts`
- `src/features/checkout/components/checkout-flow.test.tsx`
- `src/features/checkout/queries/useReservation.test.tsx`
- `src/features/orders/order-detail/components/OrderDetailClient.test.tsx`
- `src/features/orders/order-list/components/OrdersClient.test.tsx`
- `src/features/orders/order-list/queries/useOrders.test.tsx`
- `src/features/wishlist/components/WishlistClient.test.tsx`
- `src/features/wishlist/hooks/useWishlist.test.tsx`
- `src/lib/api/adapters/server.test.ts`
- `src/lib/api/client/api-error.test.ts`
- `src/lib/api/endpoints/auth.test.ts`
- `src/lib/api/endpoints/cart.test.ts`
- `src/lib/api/endpoints/order-lifecycle.test.tsx`
- `src/lib/api/endpoints/order-transitions.test.ts`
- `src/lib/api/mocks/auth-fixtures.test.ts`
- `src/lib/api/mocks/search-match.test.ts`
- `src/lib/schemas/catalog/catalog.test.ts`
- `src/lib/schemas/common/pagination.test.ts`
- `src/lib/schemas/errors/envelope.test.ts`

Các test mới đi cạnh owner hoặc e2e/production theo policy. Với consumer test khác chưa xuất hiện ở scan, bổ sung manifest/file scope trước triển khai; không thay assertion để né regression. Không công khai private stores để cứu setup test.
