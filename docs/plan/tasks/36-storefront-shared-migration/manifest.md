# Manifest phạm vi — Shared components và cơ chế dùng chung

Snapshot ban đầu ngày 25/11/2026, đã làm mới ngày 26/11/2026 theo checkout sau khi chuyển (blocker 35 done): mục source liệt kê path đích hiện tại. Đây không phải approved.files hay quyền sửa mọi file. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner (path đích sau khi chuyển)

- `src/shared/components/Accordion.tsx`
- `src/shared/components/Badge.tsx`
- `src/shared/components/Button.tsx`
- `src/shared/components/Checkbox.tsx`
- `src/shared/components/ConfirmDialog.tsx`
- `src/shared/components/Dialog.tsx`
- `src/shared/components/DropdownMenu.tsx`
- `src/shared/components/ErrorState.tsx`
- `src/shared/components/Form.tsx`
- `src/shared/components/Input.tsx`
- `src/shared/components/Label.tsx`
- `src/shared/components/LoadingSpinner.tsx`
- `src/shared/components/PageLoader.tsx`
- `src/shared/components/PageShell.tsx`
- `src/shared/components/Pagination.tsx`
- `src/shared/components/Popover.tsx`
- `src/shared/components/QuantitySelector.tsx`
- `src/shared/components/QueryState.tsx`
- `src/shared/components/Reveal.tsx`
- `src/shared/components/ScrollArea.tsx`
- `src/shared/components/SectionHeading.tsx`
- `src/shared/components/Select.tsx`
- `src/shared/components/Separator.tsx`
- `src/shared/components/Sheet.tsx`
- `src/shared/components/Skeleton.tsx`
- `src/shared/components/SocialMarks.tsx`
- `src/shared/components/Tooltip.tsx`
- `src/shared/feedback/notification.ts`
- `src/shared/formatting/currency.ts`
- `src/shared/monitoring/sentry.ts`
- `src/shared/pagination/pagination.ts`
- `src/shared/persistence/createPersistedListStore.ts`
- `src/shared/queries/useApiMutation.ts`
- `src/shared/routing/auth-cookies.ts`
- `src/shared/routing/routes.ts`
- `src/shared/styles/cn.ts`
- `src/shared/styles/focusRing.ts`
- `src/shared/styles/motion.ts`
- `src/shared/utils/utils.ts`

## Consumer trực tiếp hiện tại ngoài owner

- `src/app/[locale]/(auth)/login/page.tsx`
- `src/app/[locale]/(shop)/account/addresses/page.tsx`
- `src/app/[locale]/(shop)/account/orders/[id]/page.tsx`
- `src/app/[locale]/(shop)/account/orders/page.tsx`
- `src/app/[locale]/(shop)/account/profile/page.tsx`
- `src/app/[locale]/(shop)/cart/page.tsx`
- `src/app/[locale]/(shop)/checkout/page.tsx`
- `src/app/[locale]/(shop)/checkout/success/page.tsx`
- `src/app/[locale]/(shop)/products/page.tsx`
- `src/app/[locale]/(shop)/search/page.tsx`
- `src/app/[locale]/(shop)/wishlist/page.tsx`
- `src/app/[locale]/error.tsx`
- `src/app/[locale]/loading.tsx`
- `src/app/layout.tsx`
- `src/app/not-found.tsx`
- `src/features/account/addresses/components/AddressesClient.tsx`
- `src/features/account/addresses/queries/useDeleteAddress.ts`
- `src/features/account/addresses/queries/useSaveAddress.ts`
- `src/features/account/addresses/queries/useSetDefaultAddress.ts`
- `src/features/account/profile/components/ProfileClient.tsx`
- `src/features/account/profile/queries/useUpdateProfile.ts`
- `src/features/auth/components/PasswordInput.tsx`
- `src/features/auth/forgot-password/components/ForgotPasswordForm.tsx`
- `src/features/auth/hooks/useApiErrorMessage.ts`
- `src/features/auth/login/components/LoginForm.tsx`
- `src/features/auth/register/components/RegisterForm.tsx`
- `src/features/auth/reset-password/components/ResetPasswordForm.tsx`
- `src/features/auth/session/AuthGuard.tsx`
- `src/features/auth/session/useAuth.ts`
- `src/features/cart/components/CartClient.tsx`
- `src/features/cart/components/CartDrawer.tsx`
- `src/features/cart/components/CartSummary.tsx`
- `src/features/cart/components/CartTable.tsx`
- `src/features/cart/hooks/useCart.ts`
- `src/features/cart/stores/cart.store.ts`
- `src/features/catalog/category-detail/components/CategoryClient.tsx`
- `src/features/catalog/category-detail/components/CategoryPageClient.tsx`
- `src/features/catalog/components/CatalogProductGrid.tsx`
- `src/features/catalog/components/CategoryNav.tsx`
- `src/features/catalog/components/FilterSidebar.tsx`
- `src/features/catalog/components/PriceDisplay.tsx`
- `src/features/catalog/components/ProductCard.tsx`
- `src/features/catalog/components/ProductSkeletons.tsx`
- `src/features/catalog/product-detail/components/AddToCartSection.tsx`
- `src/features/catalog/product-detail/components/MobileBuyBar.tsx`
- `src/features/catalog/product-detail/components/ProductDetailPageClient.tsx`
- `src/features/catalog/product-detail/components/ProductDetailTabs.tsx`
- `src/features/catalog/product-detail/components/ProductGallery.tsx`
- `src/features/catalog/product-detail/components/ProductInfoPanel.tsx`
- `src/features/catalog/product-detail/components/VariantSelector.tsx`
- `src/features/catalog/product-list/components/ProductsClient.tsx`
- `src/features/catalog/search/components/SearchClient.tsx`
- `src/features/checkout/components/CheckoutClient.tsx`
- `src/features/checkout/components/OrderSummary.tsx`
- `src/features/checkout/queries/useCreateOrder.ts`
- `src/features/home/components/CountdownTimer.tsx`
- `src/features/home/components/FlashSaleBanner.tsx`
- `src/features/home/components/HeroBanner.tsx`
- `src/features/home/components/NewsletterForm.tsx`
- `src/features/home/components/SectionEditorialCollection.tsx`
- `src/features/home/components/SectionFeaturedCategories.tsx`
- `src/features/home/components/SectionHero.tsx`
- `src/features/home/components/SectionNewArrivals.tsx`
- `src/features/home/components/SectionTestimonials.tsx`
- `src/features/home/components/SectionWhyChooseUs.tsx`
- `src/features/home/components/TestimonialCard.tsx`
- `src/features/home/components/TrustBadgeList.tsx`
- `src/features/orders/components/OrderStatusBadge.tsx`
- `src/features/orders/order-detail/components/OrderDetailClient.tsx`
- `src/features/orders/order-detail/queries/useCancelOrder.ts`
- `src/features/orders/order-detail/queries/useRequestReturn.ts`
- `src/features/orders/order-list/components/OrdersClient.tsx`
- `src/features/storefront-shell/components/DesktopMegaMenu.tsx`
- `src/features/storefront-shell/components/Header.tsx`
- `src/features/storefront-shell/components/MobileNav.tsx`
- `src/features/wishlist/components/WishlistClient.tsx`
- `src/features/wishlist/hooks/useMoveToCart.ts`
- `src/features/wishlist/stores/wishlist.store.ts`
- `src/middleware.ts`

## Config/docs cần đối chiếu

- `eslint.config.mjs`
- `vitest.config.ts`
- `docs/architecture.md` và tài liệu owner tương ứng ở spec; chỉ cập nhật hiện trạng đã triển khai.

## Test cũ được thích ứng trong scope

Path đích sau khi chuyển:

- `src/shared/persistence/createPersistedListStore.test.tsx`
- `src/shared/queries/useApiMutation.test.tsx`
- `src/shared/feedback/notification.test.ts`
- `src/shared/components/ConfirmDialog.test.tsx`
- `src/shared/components/Pagination.test.tsx`
- `src/shared/components/QuantitySelector.test.tsx`
- `src/shared/pagination/pagination.test.ts`
- `src/shared/utils/utils.test.ts` (phần còn lại sau khi tách)
- `src/shared/components/PageLoader.test.tsx`, `src/shared/components/QueryState.test.tsx`, `src/shared/styles/motion.test.ts`: đã tồn tại cạnh source, chỉ đổi đường dẫn import cùng owner.
- `src/shared/styles/cn.test.ts`, `src/shared/formatting/currency.test.ts`: tách từ `utils.test.ts`.

Các test chỉ di chuyển/tách (`PageLoader.test.tsx`, `QueryState.test.tsx`, `motion.test.ts`, `cn.test.ts`, `currency.test.ts`) không đổi assertion; chỉ đổi path import và nơi đặt.

Test mới (chỉ thêm, không sửa test cũ) cho coverage tập file đã chuyển: `DropdownMenu`, `PageShell`, `Popover`, `Reveal`, `ScrollArea`, `SectionHeading`, `Select`, `Sheet`, `Skeleton`, `SocialMarks`, `Tooltip` (cạnh source trong `shared/components/`) và `shared/routing/routes.test.ts`.

Các test mới đi cạnh owner hoặc e2e/production theo policy. Với consumer test khác chưa xuất hiện ở scan, bổ sung manifest/file scope trước triển khai; không thay assertion để né regression. Không công khai private stores để cứu setup test.
