# Manifest phạm vi — Shared components và cơ chế dùng chung

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng owner đích trong mapping. Đây không phải approved.files hay quyền sửa mọi file. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `src/shared/constants/auth-cookies.ts`
- `src/shared/constants/routes.ts`
- `src/shared/lib/focusRing.ts`
- `src/shared/lib/hooks/createPersistedListStore.test.tsx`
- `src/shared/lib/hooks/createPersistedListStore.ts`
- `src/shared/lib/hooks/useApiMutation.test.tsx`
- `src/shared/lib/hooks/useApiMutation.ts`
- `src/shared/lib/monitoring/sentry.ts`
- `src/shared/lib/motion.ts`
- `src/shared/lib/notification.test.ts`
- `src/shared/lib/notification.ts`
- `src/shared/ui/Accordion.tsx`
- `src/shared/ui/Badge.tsx`
- `src/shared/ui/Button.tsx`
- `src/shared/ui/Checkbox.tsx`
- `src/shared/ui/ConfirmDialog.test.tsx`
- `src/shared/ui/ConfirmDialog.tsx`
- `src/shared/ui/Dialog.tsx`
- `src/shared/ui/DropdownMenu.tsx`
- `src/shared/ui/ErrorState.tsx`
- `src/shared/ui/Form.tsx`
- `src/shared/ui/Input.tsx`
- `src/shared/ui/Label.tsx`
- `src/shared/ui/LoadingSpinner.tsx`
- `src/shared/ui/PageLoader.tsx`
- `src/shared/ui/PageShell.tsx`
- `src/shared/ui/Pagination.test.tsx`
- `src/shared/ui/Pagination.tsx`
- `src/shared/ui/Popover.tsx`
- `src/shared/ui/QuantitySelector.test.tsx`
- `src/shared/ui/QuantitySelector.tsx`
- `src/shared/ui/QueryState.tsx`
- `src/shared/ui/Reveal.tsx`
- `src/shared/ui/ScrollArea.tsx`
- `src/shared/ui/SectionHeading.tsx`
- `src/shared/ui/Select.tsx`
- `src/shared/ui/Separator.tsx`
- `src/shared/ui/Sheet.tsx`
- `src/shared/ui/Skeleton.tsx`
- `src/shared/ui/SocialMarks.tsx`
- `src/shared/ui/Tooltip.tsx`
- `src/shared/utils/pagination.test.ts`
- `src/shared/utils/pagination.ts`
- `src/shared/utils/utils.test.ts`
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

- `src/shared/lib/hooks/createPersistedListStore.test.tsx`
- `src/shared/lib/hooks/useApiMutation.test.tsx`
- `src/shared/lib/notification.test.ts`
- `src/shared/ui/ConfirmDialog.test.tsx`
- `src/shared/ui/Pagination.test.tsx`
- `src/shared/ui/QuantitySelector.test.tsx`
- `src/shared/utils/pagination.test.ts`
- `src/shared/utils/utils.test.ts`

Các test mới đi cạnh owner hoặc e2e/production theo policy. Với consumer test khác chưa xuất hiện ở scan, bổ sung manifest/file scope trước triển khai; không thay assertion để né regression. Không công khai private stores để cứu setup test.
