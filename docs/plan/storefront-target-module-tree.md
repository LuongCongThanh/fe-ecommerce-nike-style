# Cây thư mục đích route-only của Storefront

**Bản đề xuất để review.** Áp dụng mẫu Products cho toàn bộ App Router. [Cây hiện tại](storefront-current-file-tree.md) mô tả vai trò của từng file trước khi sắp xếp.

## 1. Quy ước sở hữu

`app/` giữ các entry point theo quy ước Next.js. UI, hooks, queries và services riêng của từng màn hình nằm trong `features/`. Hai màn hình Sản phẩm nằm trong `features/catalog/product-list/` và `features/catalog/product-detail/`. Giữ URL, metadata, layout và hai locale.

| Tên | Vai trò |
| --- | --- |
| `components/` | UI riêng của trang hoặc module |
| `hooks/` | Tương tác và điều phối React |
| `queries/` | TanStack Query keys, cấu hình, query hooks và mutation hooks. Dùng chung key khi các trang đọc cùng dữ liệu |
| `stores/` | Zustand cho state client cần chia sẻ. Store chỉ thuộc một trang cần được giới hạn vòng đời theo trang |
| `services/` | Điều phối dữ liệu hoặc thao tác. Các file chuyển từ `_lib/api/` là ứng viên kiểm tra để gộp nếu chỉ chuyển tiếp |
| `schemas/`, `types/`, `constants/` | Validation, kiểu và cấu hình theo nơi sở hữu. Enum backend dùng hợp đồng OpenAPI |
| `*.test.ts(x)` | Đặt cùng thư mục với file được kiểm thử. Test tích hợp đặt cạnh điểm vào của luồng. Playwright tiếp tục ở `e2e/` |

- `features/` giữ phần nghiệp vụ dùng qua nhiều route. Catalog sở hữu query danh sách và bộ lọc URL chung cho Products, Danh mục và Search. Cart, Wishlist và Auth sở hữu store dùng qua nhiều màn hình.
- `shared/ui/` chứa UI dùng xuyên nghiệp vụ. `shared/utils/` chứa hàm dùng chung. Logic chọn Biến thể dùng ở PDP và Wishlist thuộc Catalog. `variantColor.ts` nằm cạnh trang chi tiết.
- `lib/api/` giữ HTTP client, endpoint, OpenAPI và MSW chuyển tiếp. Dữ liệu từ backend nằm trong TanStack Query khi dùng cache client. URL sở hữu filter, sort và pagination. Zustand giữ UI state và dữ liệu local đã có trong giai đoạn chuyển tiếp.
- Trang chi tiết tiếp tục dùng `useVariantSelection.ts`. Chỉ thêm store riêng nếu có nhiều vùng UI thực sự chia sẻ state.
- Chuyển setup dùng chung sang `src/testing/setup.ts`. Khi triển khai, cập nhật `setupFiles`, đổi Vitest `include` từ `src/**/__tests__/**/*.{test,spec}.{ts,tsx}` thành `src/**/*.{test,spec}.{ts,tsx}`, rồi sửa coverage exclude và các quy tắc lint còn dựa vào `__tests__`. So sánh danh sách test được runner phát hiện trước và sau khi chuyển.

## 2. Cây đích đến từng file

**[K]** giữ đường dẫn, **[M]** chuyển từ đường dẫn sau mũi tên, **[N]** tách file đề xuất. Các thư mục chỉ xuất hiện khi có file thực tế hoặc phần tách đã nêu.

### Source và tài liệu được di chuyển

```text
fe-ecommerce-nike-style/
├── docs/
│   └── reference/
│       └── home-motion/
│           ├── 001-trustbadgelist-stagger.md  [M] ← src/app/[locale]/(shop)/_lib/components/home/plans/001-trustbadgelist-stagger.md
│           ├── 002-section-entrance-reveal.md  [M] ← src/app/[locale]/(shop)/_lib/components/home/plans/002-section-entrance-reveal.md
│           ├── 003-newsletterform-state-transition.md  [M] ← src/app/[locale]/(shop)/_lib/components/home/plans/003-newsletterform-state-transition.md
│           ├── 004-herocarousel-entrance-sync.md  [M] ← src/app/[locale]/(shop)/_lib/components/home/plans/004-herocarousel-entrance-sync.md
│           ├── 005-consolidate-ease-duration-literals.md  [M] ← src/app/[locale]/(shop)/_lib/components/home/plans/005-consolidate-ease-duration-literals.md
│           ├── 006-sectionhero-transform-string.md  [M] ← src/app/[locale]/(shop)/_lib/components/home/plans/006-sectionhero-transform-string.md
│           └── README.md  [M] ← src/app/[locale]/(shop)/_lib/components/home/plans/README.md
└── src/
    ├── app/
    │   ├── [locale]/
    │   │   ├── (auth)/
    │   │   │   ├── forgot-password/
    │   │   │   │   └── page.tsx  [K]
    │   │   │   ├── layout.tsx  [K]
    │   │   │   ├── login/
    │   │   │   │   └── page.tsx  [K]
    │   │   │   ├── register/
    │   │   │   │   └── page.tsx  [K]
    │   │   │   └── reset-password/
    │   │   │       └── [token]/
    │   │   │           └── page.tsx  [K]
    │   │   ├── (shop)/
    │   │   │   ├── account/
    │   │   │   │   ├── addresses/
    │   │   │   │   │   └── page.tsx  [K]
    │   │   │   │   ├── layout.tsx  [K]
    │   │   │   │   ├── orders/
    │   │   │   │   │   ├── [id]/
    │   │   │   │   │   │   └── page.tsx  [K]
    │   │   │   │   │   └── page.tsx  [K]
    │   │   │   │   └── profile/
    │   │   │   │       └── page.tsx  [K]
    │   │   │   ├── cart/
    │   │   │   │   └── page.tsx  [K]
    │   │   │   ├── categories/
    │   │   │   │   └── [slug]/
    │   │   │   │       └── page.tsx  [K]
    │   │   │   ├── checkout/
    │   │   │   │   ├── layout.tsx  [K]
    │   │   │   │   ├── page.tsx  [K]
    │   │   │   │   └── success/
    │   │   │   │       └── page.tsx  [K]
    │   │   │   ├── home/
    │   │   │   │   └── page.tsx  [K]
    │   │   │   ├── layout.tsx  [K]
    │   │   │   ├── page.tsx  [K]
    │   │   │   ├── products/
    │   │   │   │   ├── [slug]/
    │   │   │   │   │   └── page.tsx  [K]
    │   │   │   │   └── page.tsx  [K]
    │   │   │   ├── search/
    │   │   │   │   └── page.tsx  [K]
    │   │   │   └── wishlist/
    │   │   │       └── page.tsx  [K]
    │   │   ├── error.tsx  [K]
    │   │   ├── layout.tsx  [K]
    │   │   └── loading.tsx  [K]
    │   ├── ~offline/
    │   │   └── page.tsx  [K]
    │   ├── favicon.ico  [K]
    │   ├── layout.tsx  [K]
    │   ├── not-found.tsx  [K]
    │   ├── opengraph-image.tsx  [K]
    │   └── page.tsx  [K]
    ├── features/
    │   ├── account/
    │   │   ├── addresses/
    │   │   │   ├── components/
    │   │   │   │   ├── AddressesClient.test.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/addresses/__tests__/AddressesClient.test.tsx
    │   │   │   │   └── AddressesClient.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/addresses/AddressesClient.tsx
    │   │   │   ├── hooks/
    │   │   │   │   └── useAddressForm.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/addresses/useAddressForm.ts
    │   │   │   ├── queries/
    │   │   │   │   ├── addressKeys.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/addresses/addressKeys.ts
    │   │   │   │   ├── useAddresses.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/addresses/useAddresses.ts
    │   │   │   │   ├── useDeleteAddress.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/addresses/useDeleteAddress.ts
    │   │   │   │   ├── useSaveAddress.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/addresses/useSaveAddress.ts
    │   │   │   │   └── useSetDefaultAddress.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/addresses/useSetDefaultAddress.ts
    │   │   │   ├── schemas/
    │   │   │   │   └── address.ts  [M] ← src/app/[locale]/(shop)/_lib/schemas/address.ts
    │   │   │   └── services/
    │   │   │       └── address.ts  [M] ← src/app/[locale]/(shop)/_lib/api/address.ts
    │   │   └── profile/
    │   │       ├── components/
    │   │       │   ├── ProfileClient.test.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/profile/__tests__/ProfileClient.test.tsx
    │   │       │   └── ProfileClient.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/profile/ProfileClient.tsx
    │   │       ├── hooks/
    │   │       │   └── useProfileForm.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/profile/useProfileForm.ts
    │   │       ├── queries/
    │   │       │   ├── useProfile.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/profile/useProfile.ts
    │   │       │   └── useUpdateProfile.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/profile/useUpdateProfile.ts
    │   │       ├── schemas/
    │   │       │   └── profile.ts  [M] ← src/app/[locale]/(shop)/_lib/schemas/profile.ts
    │   │       └── services/
    │   │           └── profile.ts  [M] ← src/app/[locale]/(shop)/_lib/api/profile.ts
    │   ├── auth/
    │   │   ├── components/
    │   │   │   ├── ApiErrorAlert.tsx  [M] ← src/app/[locale]/(auth)/_lib/components/ApiErrorAlert.tsx
    │   │   │   ├── PasswordInput.test.tsx  [M] ← src/app/[locale]/(auth)/_lib/components/__tests__/PasswordInput.test.tsx
    │   │   │   └── PasswordInput.tsx  [M] ← src/app/[locale]/(auth)/_lib/components/PasswordInput.tsx
    │   │   ├── forgot-password/
    │   │   │   └── components/
    │   │   │       └── ForgotPasswordForm.tsx  [M] ← src/app/[locale]/(auth)/_lib/components/ForgotPasswordForm.tsx
    │   │   ├── hooks/
    │   │   │   ├── useApiErrorMessage.ts  [M] ← src/app/[locale]/(auth)/_lib/hooks/useApiErrorMessage.ts
    │   │   │   └── useMergeGuestDataOnLogin.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/useMergeGuestDataOnLogin.ts
    │   │   ├── login/
    │   │   │   └── components/
    │   │   │       └── LoginForm.tsx  [M] ← src/app/[locale]/(auth)/_lib/components/LoginForm.tsx
    │   │   ├── register/
    │   │   │   └── components/
    │   │   │       └── RegisterForm.tsx  [M] ← src/app/[locale]/(auth)/_lib/components/RegisterForm.tsx
    │   │   ├── reset-password/
    │   │   │   └── components/
    │   │   │       └── ResetPasswordForm.tsx  [M] ← src/app/[locale]/(auth)/_lib/components/ResetPasswordForm.tsx
    │   │   ├── schemas/
    │   │   │   └── auth.ts  [M] ← src/app/[locale]/(auth)/_lib/schemas/auth.ts
    │   │   ├── services/
    │   │   │   └── auth.ts  [M] ← src/app/[locale]/(auth)/_lib/api/auth.ts
    │   │   ├── session/
    │   │   │   ├── AuthGuard.tsx  [M] ← src/core/session/AuthGuard.tsx
    │   │   │   ├── AuthRuntimeProvider.tsx  [M] ← src/core/session/AuthRuntimeProvider.tsx
    │   │   │   ├── roles.test.ts  [M] ← src/core/session/__tests__/roles.test.ts
    │   │   │   ├── roles.ts  [M] ← src/core/session/roles.ts
    │   │   │   ├── useAuth.test.ts  [M] ← src/core/session/__tests__/useAuth.test.ts
    │   │   │   └── useAuth.ts  [M] ← src/core/session/useAuth.ts
    │   │   └── stores/
    │   │       ├── auth-store.test.ts  [M] ← src/core/session/__tests__/auth-store.test.ts
    │   │       └── auth.store.ts  [M] ← src/core/session/auth-store.ts
    │   ├── cart/
    │   │   ├── components/
    │   │   │   ├── CartClient.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/cart/CartClient.tsx
    │   │   │   ├── CartDrawer.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/cart/CartDrawer.tsx
    │   │   │   ├── CartSummary.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/cart/CartSummary.tsx
    │   │   │   └── CartTable.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/cart/CartTable.tsx
    │   │   ├── hooks/
    │   │   │   ├── useCart.test.tsx  [M] ← src/app/[locale]/(shop)/_lib/hooks/__tests__/useCart.test.tsx
    │   │   │   └── useCart.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/useCart.ts
    │   │   └── stores/
    │   │       └── cart.store.ts  [N] Tách phần Zustand từ useCart.ts
    │   ├── catalog/
    │   │   ├── catalogUrlState.test.ts  [M] ← src/app/[locale]/(shop)/_lib/utils/__tests__/catalogUrlState.test.ts
    │   │   ├── catalogUrlState.ts  [M] ← src/app/[locale]/(shop)/_lib/utils/catalogUrlState.ts
    │   │   ├── category-detail/
    │   │   │   └── components/
    │   │   │       ├── CategoryClient.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/categories/CategoryClient.tsx
    │   │   │       └── CategoryPageClient.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/categories/CategoryPageClient.tsx
    │   │   ├── categoryTree.ts  [M] ← src/app/[locale]/(shop)/_lib/utils/categoryTree.ts
    │   │   ├── components/
    │   │   │   ├── CatalogProductGrid.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/products/CatalogProductGrid.tsx
    │   │   │   ├── CategoryCard.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/common/CategoryCard.tsx
    │   │   │   ├── CategoryNav.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/categories/CategoryNav.tsx
    │   │   │   ├── FilterSidebar.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/categories/FilterSidebar.tsx
    │   │   │   ├── PriceDisplay.test.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/common/__tests__/PriceDisplay.test.tsx
    │   │   │   ├── PriceDisplay.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/common/PriceDisplay.tsx
    │   │   │   ├── ProductCard.test.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/common/__tests__/ProductCard.test.tsx
    │   │   │   ├── ProductCard.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/common/ProductCard.tsx
    │   │   │   ├── ProductCarousel.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/common/ProductCarousel.tsx
    │   │   │   └── ProductSkeletons.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/products/ProductSkeletons.tsx
    │   │   ├── discount.test.ts  [M] ← src/app/[locale]/(shop)/_lib/utils/__tests__/discount.test.ts
    │   │   ├── discount.ts  [M] ← src/app/[locale]/(shop)/_lib/utils/discount.ts
    │   │   ├── hooks/
    │   │   │   ├── useCatalogFilterControls.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/categories/useCatalogFilterControls.ts
    │   │   │   ├── useCatalogListing.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/products/useCatalogListing.ts
    │   │   │   └── useProductSearchListing.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/products/useProductSearchListing.ts
    │   │   ├── priceRange.test.ts  [M] ← src/app/[locale]/(shop)/_lib/utils/__tests__/priceRange.test.ts
    │   │   ├── priceRange.ts  [M] ← src/app/[locale]/(shop)/_lib/utils/priceRange.ts
    │   │   ├── product-detail/
    │   │   │   ├── components/
    │   │   │   │   ├── AddToCartSection.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/products/AddToCartSection.tsx
    │   │   │   │   ├── MobileBuyBar.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/products/MobileBuyBar.tsx
    │   │   │   │   ├── ProductDetailPageClient.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/products/ProductDetailPageClient.tsx
    │   │   │   │   ├── ProductDetailTabs.test.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/products/__tests__/ProductDetailTabs.test.tsx
    │   │   │   │   ├── ProductDetailTabs.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/products/ProductDetailTabs.tsx
    │   │   │   │   ├── ProductGallery.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/products/ProductGallery.tsx
    │   │   │   │   ├── ProductInfoPanel.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/products/ProductInfoPanel.tsx
    │   │   │   │   ├── ProductViewer3D.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/products/ProductViewer3D.tsx
    │   │   │   │   └── VariantSelector.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/products/VariantSelector.tsx
    │   │   │   ├── hooks/
    │   │   │   │   └── useVariantSelection.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/products/useVariantSelection.ts
    │   │   │   ├── queries/
    │   │   │   │   ├── useProduct.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/products/useProduct.ts
    │   │   │   │   └── useRelatedProducts.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/products/useRelatedProducts.ts
    │   │   │   ├── variantColor.test.ts  [M] ← src/app/[locale]/(shop)/_lib/utils/__tests__/variantColor.test.ts
    │   │   │   └── variantColor.ts  [M] ← src/app/[locale]/(shop)/_lib/utils/variantColor.ts
    │   │   ├── product-list/
    │   │   │   └── components/
    │   │   │       └── ProductsClient.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/products/ProductsClient.tsx
    │   │   ├── queries/
    │   │   │   ├── catalogKeys.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/products/catalogKeys.ts
    │   │   │   ├── useCatalogOptions.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/categories/useCatalogOptions.ts
    │   │   │   ├── useCategoryTree.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/categories/useCategoryTree.ts
    │   │   │   ├── useProducts.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/products/useProducts.ts
    │   │   │   └── useProductSearch.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/products/useProductSearch.ts
    │   │   ├── schemas/
    │   │   │   └── filter.ts  [M] ← src/app/[locale]/(shop)/_lib/schemas/filter.ts
    │   │   ├── search/
    │   │   │   ├── components/
    │   │   │   │   ├── SearchClient.test.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/search/__tests__/SearchClient.test.tsx
    │   │   │   │   └── SearchClient.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/search/SearchClient.tsx
    │   │   │   └── hooks/
    │   │   │       └── useHeaderSearch.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/useHeaderSearch.ts
    │   │   ├── variantResolution.test.ts  [M] ← src/app/[locale]/(shop)/_lib/utils/__tests__/variantResolution.test.ts
    │   │   └── variantResolution.ts  [M] ← src/app/[locale]/(shop)/_lib/utils/variantResolution.ts
    │   ├── checkout/
    │   │   ├── components/
    │   │   │   ├── checkout-flow.test.tsx  [M] ← src/app/[locale]/(shop)/_lib/hooks/checkout/__tests__/checkout-flow.test.tsx
    │   │   │   ├── CheckoutClient.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/checkout/CheckoutClient.tsx
    │   │   │   └── OrderSummary.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/checkout/OrderSummary.tsx
    │   │   ├── constants/
    │   │   │   └── payment-config.ts  [M] ← src/app/[locale]/(shop)/_lib/constants/payment-config.ts
    │   │   ├── hooks/
    │   │   │   ├── useCheckoutForm.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/checkout/useCheckoutForm.ts
    │   │   │   └── useRedirectIfCartEmpty.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/checkout/useRedirectIfCartEmpty.ts
    │   │   ├── queries/
    │   │   │   ├── useCreateOrder.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/checkout/useCreateOrder.ts
    │   │   │   ├── useReservation.test.tsx  [M] ← src/app/[locale]/(shop)/_lib/hooks/checkout/__tests__/useReservation.test.tsx
    │   │   │   └── useReservation.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/checkout/useReservation.ts
    │   │   ├── schemas/
    │   │   │   └── checkout.ts  [M] ← src/app/[locale]/(shop)/_lib/schemas/checkout.ts
    │   │   └── services/
    │   │       └── checkout.ts  [M] ← src/app/[locale]/(shop)/_lib/api/checkout.ts
    │   ├── home/
    │   │   ├── components/
    │   │   │   ├── CountdownTimer.test.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/home/__tests__/CountdownTimer.test.tsx
    │   │   │   ├── CountdownTimer.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/home/CountdownTimer.tsx
    │   │   │   ├── FlashSaleBanner.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/common/FlashSaleBanner.tsx
    │   │   │   ├── hero3d/
    │   │   │   │   ├── cssColor.ts  [M] ← src/app/[locale]/(shop)/_lib/components/home/hero3d/cssColor.ts
    │   │   │   │   ├── dissolveShader.ts  [M] ← src/app/[locale]/(shop)/_lib/components/home/hero3d/dissolveShader.ts
    │   │   │   │   └── HeroSlides3D.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/home/hero3d/HeroSlides3D.tsx
    │   │   │   ├── HeroBanner.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/common/HeroBanner.tsx
    │   │   │   ├── HeroCarousel.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/home/HeroCarousel.tsx
    │   │   │   ├── motion.ts  [M] ← src/app/[locale]/(shop)/_lib/components/home/motion.ts
    │   │   │   ├── NewsletterForm.test.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/home/__tests__/NewsletterForm.test.tsx
    │   │   │   ├── NewsletterForm.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/home/NewsletterForm.tsx
    │   │   │   ├── SectionFeaturedCategories.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/home/SectionFeaturedCategories.tsx
    │   │   │   ├── SectionHero.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/home/SectionHero.tsx
    │   │   │   ├── SectionNewArrivals.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/home/SectionNewArrivals.tsx
    │   │   │   ├── SectionNewsletter.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/home/SectionNewsletter.tsx
    │   │   │   ├── SectionTestimonials.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/home/SectionTestimonials.tsx
    │   │   │   ├── SectionWhyChooseUs.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/home/SectionWhyChooseUs.tsx
    │   │   │   ├── TestimonialCard.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/home/TestimonialCard.tsx
    │   │   │   └── TrustBadgeList.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/home/TrustBadgeList.tsx
    │   │   ├── home-content.ts  [M] ← src/app/[locale]/(shop)/_lib/data/home.ts
    │   │   ├── hooks/
    │   │   │   ├── useHomeFlashSaleCountdown.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/home/useHomeFlashSaleCountdown.ts
    │   │   │   └── useNewsletterForm.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/home/useNewsletterForm.ts
    │   │   └── types/
    │   │       └── home.ts  [M] ← src/app/[locale]/(shop)/_lib/types/home.ts
    │   ├── orders/
    │   │   ├── components/
    │   │   │   └── OrderStatusBadge.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/common/OrderStatusBadge.tsx
    │   │   ├── order-detail/
    │   │   │   ├── components/
    │   │   │   │   ├── OrderDetailClient.test.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/orders/__tests__/OrderDetailClient.test.tsx
    │   │   │   │   └── OrderDetailClient.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/orders/OrderDetailClient.tsx
    │   │   │   └── queries/
    │   │   │       ├── useCancelOrder.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/orders/useCancelOrder.ts
    │   │   │       ├── useOrder.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/orders/useOrder.ts
    │   │   │       └── useRequestReturn.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/orders/useRequestReturn.ts
    │   │   ├── order-list/
    │   │   │   ├── components/
    │   │   │   │   ├── OrdersClient.test.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/orders/__tests__/OrdersClient.test.tsx
    │   │   │   │   └── OrdersClient.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/orders/OrdersClient.tsx
    │   │   │   └── queries/
    │   │   │       ├── useOrders.test.tsx  [M] ← src/app/[locale]/(shop)/_lib/hooks/orders/__tests__/useOrders.test.tsx
    │   │   │       └── useOrders.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/orders/useOrders.ts
    │   │   ├── queries/
    │   │   │   └── orderKeys.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/orders/orderKeys.ts
    │   │   └── services/
    │   │       └── order.ts  [M] ← src/app/[locale]/(shop)/_lib/api/order.ts
    │   ├── storefront-shell/
    │   │   ├── components/
    │   │   │   ├── DesktopMegaMenu.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/navigation/DesktopMegaMenu.tsx
    │   │   │   ├── Footer.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/layout/Footer.tsx
    │   │   │   ├── Header.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/layout/Header.tsx
    │   │   │   ├── MobileNav.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/navigation/MobileNav.tsx
    │   │   │   └── PageShell.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/layout/PageShell.tsx
    │   │   └── providers/
    │   │       └── AppProviders.tsx  [M] ← src/app/providers.tsx
    │   └── wishlist/
    │       ├── components/
    │       │   ├── WishlistClient.test.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/wishlist/__tests__/WishlistClient.test.tsx
    │       │   └── WishlistClient.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/wishlist/WishlistClient.tsx
    │       ├── hooks/
    │       │   ├── useMoveToCart.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/wishlist/useMoveToCart.ts
    │       │   ├── useWishlist.test.tsx  [M] ← src/app/[locale]/(shop)/_lib/hooks/__tests__/useWishlist.test.tsx
    │       │   └── useWishlist.ts  [M] ← src/app/[locale]/(shop)/_lib/hooks/useWishlist.ts
    │       └── stores/
    │           └── wishlist.store.ts  [N] Tách phần Zustand từ useWishlist.ts
    ├── helpers/
    │   └── render.tsx  [M] ← src/__tests__/helpers/render.tsx
    ├── i18n/
    │   ├── create-request-config.test.ts  [M] ← src/i18n/__tests__/create-request-config.test.ts
    │   ├── create-request-config.ts  [K]
    │   ├── locales.test.ts  [M] ← src/i18n/__tests__/locales.test.ts
    │   ├── locales.ts  [K]
    │   └── request.ts  [K]
    ├── instrumentation.node.ts  [K]
    ├── instrumentation.ts  [K]
    ├── lang/
    │   ├── en/
    │   │   ├── address.json  [K]
    │   │   ├── auth.json  [K]
    │   │   ├── cart.json  [K]
    │   │   ├── checkout.json  [K]
    │   │   ├── common.json  [K]
    │   │   ├── home.json  [K]
    │   │   ├── order.json  [K]
    │   │   ├── payment.json  [K]
    │   │   ├── product.json  [K]
    │   │   ├── profile.json  [K]
    │   │   └── wishlist.json  [K]
    │   └── vi/
    │       ├── address.json  [K]
    │       ├── auth.json  [K]
    │       ├── cart.json  [K]
    │       ├── checkout.json  [K]
    │       ├── common.json  [K]
    │       ├── home.json  [K]
    │       ├── order.json  [K]
    │       ├── payment.json  [K]
    │       ├── product.json  [K]
    │       ├── profile.json  [K]
    │       └── wishlist.json  [K]
    ├── lib/
    │   ├── api/
    │   │   ├── adapters/
    │   │   │   ├── browser.ts  [K]
    │   │   │   ├── server.test.ts  [M] ← src/lib/api/adapters/__tests__/server.test.ts
    │   │   │   └── server.ts  [K]
    │   │   ├── client/
    │   │   │   ├── api-error.test.ts  [M] ← src/lib/api/client/__tests__/api-error.test.ts
    │   │   │   ├── api-error.ts  [K]
    │   │   │   ├── fetcher.ts  [K]
    │   │   │   └── runtime.ts  [K]
    │   │   ├── endpoints/
    │   │   │   ├── address.ts  [K]
    │   │   │   ├── auth.test.ts  [M] ← src/lib/api/endpoints/__tests__/auth.test.ts
    │   │   │   ├── auth.ts  [K]
    │   │   │   ├── cart.test.ts  [M] ← src/lib/api/endpoints/__tests__/cart.test.ts
    │   │   │   ├── cart.ts  [K]
    │   │   │   ├── catalog.ts  [K]
    │   │   │   ├── checkout.ts  [K]
    │   │   │   ├── order-lifecycle.test.tsx  [M] ← src/app/[locale]/(shop)/_lib/hooks/orders/__tests__/order-lifecycle.test.tsx
    │   │   │   ├── order-transitions.test.ts  [M] ← src/lib/api/endpoints/__tests__/order-transitions.test.ts
    │   │   │   ├── order-transitions.ts  [K]
    │   │   │   ├── orders.ts  [K]
    │   │   │   ├── profile.ts  [K]
    │   │   │   └── wishlist.ts  [K]
    │   │   ├── env/
    │   │   │   └── config.ts  [K]
    │   │   ├── generated/
    │   │   │   └── openapi.ts  [K]
    │   │   ├── mocks/
    │   │   │   ├── address-fixtures.ts  [K]
    │   │   │   ├── auth-fixtures.test.ts  [M] ← src/lib/api/mocks/__tests__/auth-fixtures.test.ts
    │   │   │   ├── auth-fixtures.ts  [K]
    │   │   │   ├── cart-fixtures.ts  [K]
    │   │   │   ├── catalog-fixtures.ts  [K]
    │   │   │   ├── handlers.ts  [K]
    │   │   │   ├── order-fixtures.ts  [K]
    │   │   │   ├── reservation-fixtures.ts  [K]
    │   │   │   ├── search-match.test.ts  [M] ← src/lib/api/mocks/__tests__/search-match.test.ts
    │   │   │   ├── search-match.ts  [K]
    │   │   │   └── wishlist-fixtures.ts  [K]
    │   │   ├── models/
    │   │   │   └── catalog.ts  [K]
    │   │   └── testing/
    │   │       ├── msw-browser.ts  [K]
    │   │       └── msw-server.ts  [K]
    │   └── schemas/
    │       ├── address/
    │       │   └── address.ts  [K]
    │       ├── auth/
    │       │   └── auth.ts  [K]
    │       ├── cart/
    │       │   └── cart.ts  [K]
    │       ├── catalog/
    │       │   ├── catalog.test.ts  [M] ← src/lib/schemas/catalog/__tests__/catalog.test.ts
    │       │   └── catalog.ts  [K]
    │       ├── common/
    │       │   ├── pagination.test.ts  [M] ← src/lib/schemas/common/__tests__/pagination.test.ts
    │       │   └── pagination.ts  [K]
    │       ├── errors/
    │       │   ├── envelope.test.ts  [M] ← src/lib/schemas/errors/__tests__/envelope.test.ts
    │       │   └── envelope.ts  [K]
    │       ├── order/
    │       │   └── order.ts  [K]
    │       ├── profile/
    │       │   └── profile.ts  [K]
    │       └── wishlist/
    │           └── wishlist.ts  [K]
    ├── middleware.test.ts  [M] ← src/__tests__/middleware.test.ts
    ├── middleware.ts  [K]
    ├── pwa/
    │   └── sw.ts  [M] ← src/app/sw.ts
    ├── shared/
    │   ├── constants/
    │   │   ├── app-config.ts  [K]
    │   │   ├── auth-cookies.ts  [K]
    │   │   ├── query-keys.ts  [K]
    │   │   └── routes.ts  [K]
    │   ├── hooks/
    │   │   ├── useCanRender3D.test.ts  [M] ← src/shared/hooks/__tests__/useCanRender3D.test.ts
    │   │   ├── useCanRender3D.ts  [K]
    │   │   ├── useLocalStorage.test.ts  [M] ← src/shared/hooks/__tests__/useLocalStorage.test.ts
    │   │   ├── useLocalStorage.ts  [K]
    │   │   ├── useMediaQuery.test.ts  [M] ← src/shared/hooks/__tests__/useMediaQuery.test.ts
    │   │   ├── useMediaQuery.ts  [K]
    │   │   ├── usePagination.test.ts  [M] ← src/shared/hooks/__tests__/usePagination.test.ts
    │   │   └── usePagination.ts  [K]
    │   ├── lib/
    │   │   ├── api-mocking.ts  [K]
    │   │   ├── cloudinary.test.ts  [M] ← src/shared/lib/__tests__/cloudinary.test.ts
    │   │   ├── cloudinary.ts  [K]
    │   │   ├── env.ts  [K]
    │   │   ├── errors/
    │   │   │   ├── api-error.test.ts  [M] ← src/shared/lib/__tests__/api-error.test.ts
    │   │   │   ├── api-error.ts  [K]
    │   │   │   └── error-codes.ts  [K]
    │   │   ├── focusRing.ts  [K]
    │   │   ├── hooks/
    │   │   │   ├── createPersistedListStore.test.tsx  [M] ← src/shared/lib/hooks/__tests__/createPersistedListStore.test.tsx
    │   │   │   ├── createPersistedListStore.ts  [K]
    │   │   │   ├── useApiMutation.test.tsx  [M] ← src/shared/lib/hooks/__tests__/useApiMutation.test.tsx
    │   │   │   └── useApiMutation.ts  [K]
    │   │   ├── mock-content.ts  [K]
    │   │   ├── monitoring/
    │   │   │   └── sentry.ts  [K]
    │   │   ├── motion.ts  [K]
    │   │   ├── notification.test.ts  [M] ← src/shared/lib/__tests__/notification.test.ts
    │   │   ├── notification.ts  [K]
    │   │   ├── query-client.ts  [K]
    │   │   ├── seo.test.ts  [M] ← src/shared/lib/__tests__/seo.test.ts
    │   │   └── seo.ts  [K]
    │   ├── types/
    │   │   ├── address.ts  [K]
    │   │   ├── filter.ts  [K]
    │   │   ├── order.ts  [K]
    │   │   ├── product.ts  [K]
    │   │   └── user.ts  [K]
    │   ├── ui/
    │   │   ├── Accordion.tsx  [M] ← src/components/ui/Accordion.tsx
    │   │   ├── Badge.tsx  [M] ← src/components/ui/Badge.tsx
    │   │   ├── Button.tsx  [M] ← src/components/ui/Button.tsx
    │   │   ├── Checkbox.tsx  [M] ← src/components/ui/Checkbox.tsx
    │   │   ├── ConfirmDialog.test.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/common/__tests__/ConfirmDialog.test.tsx
    │   │   ├── ConfirmDialog.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/common/ConfirmDialog.tsx
    │   │   ├── Dialog.tsx  [M] ← src/components/ui/Dialog.tsx
    │   │   ├── DropdownMenu.tsx  [M] ← src/components/ui/DropdownMenu.tsx
    │   │   ├── ErrorState.tsx  [M] ← src/shared/components/ErrorState.tsx
    │   │   ├── Form.tsx  [M] ← src/components/ui/Form.tsx
    │   │   ├── Input.tsx  [M] ← src/components/ui/Input.tsx
    │   │   ├── Label.tsx  [M] ← src/components/ui/Label.tsx
    │   │   ├── LoadingSpinner.tsx  [M] ← src/shared/components/LoadingSpinner.tsx
    │   │   ├── PageLoader.tsx  [M] ← src/shared/components/PageLoader.tsx
    │   │   ├── Pagination.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/common/Pagination.tsx
    │   │   ├── Popover.tsx  [M] ← src/components/ui/Popover.tsx
    │   │   ├── QuantitySelector.test.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/common/__tests__/QuantitySelector.test.tsx
    │   │   ├── QuantitySelector.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/common/QuantitySelector.tsx
    │   │   ├── QueryState.tsx  [M] ← src/shared/components/QueryState.tsx
    │   │   ├── Reveal.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/common/Reveal.tsx
    │   │   ├── ScrollArea.tsx  [M] ← src/components/ui/ScrollArea.tsx
    │   │   ├── SectionHeading.tsx  [M] ← src/app/[locale]/(shop)/_lib/components/common/SectionHeading.tsx
    │   │   ├── Select.tsx  [M] ← src/components/ui/Select.tsx
    │   │   ├── Separator.tsx  [M] ← src/components/ui/Separator.tsx
    │   │   ├── Sheet.tsx  [M] ← src/components/ui/Sheet.tsx
    │   │   ├── Skeleton.tsx  [M] ← src/components/ui/Skeleton.tsx
    │   │   ├── SocialMarks.tsx  [M] ← src/components/ui/SocialMarks.tsx
    │   │   └── Tooltip.tsx  [M] ← src/components/ui/Tooltip.tsx
    │   └── utils/
    │       ├── utils.test.ts  [M] ← src/shared/lib/__tests__/utils.test.ts
    │       └── utils.ts  [M] ← src/shared/lib/utils.ts
    ├── styles/
    │   ├── globals.css  [M] ← src/app/globals.css
    │   ├── login.css  [K]
    │   ├── preset.css  [K]
    │   └── theme.css  [K]
    └── testing/
        └── setup.ts  [M] ← src/__tests__/setup.ts
```

### Root, test trình duyệt và tài nguyên

```text
fe-ecommerce-nike-style/
├── .github/                    # CI và PR template
├── .husky/                     # Git hooks
├── .claude/                    # Quy tắc và workflow agent cần cập nhật đường dẫn
├── .agents/                    # Skill hiện có
├── agent/                      # Skill hiện có
├── docs/
│   ├── adr/                    # Hồ sơ quyết định
│   ├── agents/                 # Bản đồ quy ước agent
│   ├── plan/                   # Kế hoạch và cây nguồn/đích
│   └── reference/              # Tài liệu tham khảo, gồm home-motion/
├── e2e/                        # Playwright theo hành trình Người mua
├── public/                     # Tài nguyên, manifest PWA và worker MSW chuyển tiếp
├── scripts/
│   └── gen-api.mjs             # Sinh OpenAPI types từ bản pin
├── README.md
├── AGENTS.md
├── CONTRIBUTING.md
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml         # Cấu hình pnpm root
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── eslint.base.mjs
├── postcss.config.mjs
├── tailwind.config.ts
├── vitest.config.ts
└── playwright.config.ts
```

Các file root, tài liệu, test E2E và tài nguyên hiện có giữ nguyên đường dẫn trừ mục `home-motion` được ghi ở cây chi tiết. Danh sách đầy đủ của nhóm này có trong [cây hiện tại](storefront-current-file-tree.md).

## 3. Những file rời cây ở các PR tiếp theo

| Cụm | Quyết định và điều kiện |
| --- | --- |
| `auth-cookies.ts`, `roles.ts`, test role và nhánh Admin trong middleware | Gỡ cùng nhau sau khi review redirect và xác nhận không còn consumer storefront. Vẫn giữ bảo vệ tài khoản và checkout theo hành vi hiện hành trong đợt di chuyển |
| `public/{next,vercel,file,globe,window}.svg` | Xóa sau khi rà URL tĩnh, URL động, manifest và cấu hình deploy |
| `*-actions.ts`, kiểu dữ liệu và schema chuyển tiếp trùng nhiệm vụ | Gộp theo deletion test sau khi đối chiếu caller và test. Form validation có thể tiếp tục dùng Zod khi transport đã chuyển sang type sinh |
| `lib/api/{mocks,testing,adapters}`, `public/mockServiceWorker.js` và startup mock | Gỡ từng phần sau khi API tương ứng đã chuyển. Giữ mock phục vụ các luồng và test còn dùng. Giữ worker Serwist phục vụ PWA |
| Giỏ local và checkout mô phỏng | Thay trong Tier 1 sau khi pin contract cho phiên Người mua, Giỏ hàng, Tính thử và đặt Đơn hàng. Quyết định cách xử lý dữ liệu local cũ trước cutover |

## 4. Trình tự triển khai sau review

1. Thử mẫu route-only với hai trang Products, rồi áp dụng cho Catalog và Search. Bảo toàn mapper, filter URL, SSR, metadata và slug. Kiểm tra trang danh sách, chi tiết và tìm kiếm ở hai locale.
2. Chuyển layout, UI dùng chung và các trang auth/account. Cập nhật import, eslint, provider và test. Kiểm tra refresh đồng thời và redirect đăng nhập.
3. Chuyển các trang cart, wishlist, checkout và orders theo cây đề xuất. Giữ hành vi mock hiện tại trong đợt di chuyển. Thực hiện cutover Tier 1 theo [plan restructure](storefront-restructure-plan.md).
4. Đối chiếu quy tắc agent và tài liệu theo [plan clean code](storefront-clean-code-plan.md). Chạy lint, format check, typecheck, test và build sau mỗi cụm. Kiểm tra E2E ở nơi đổi luồng và xác minh không còn import đường dẫn cũ trước khi xóa.
