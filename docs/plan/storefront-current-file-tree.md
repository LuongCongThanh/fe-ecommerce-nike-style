# Cây file hiện tại của Storefront

Ảnh chụp checkout tại ngày 14/11/2026, gồm **566 file** có trong Git index hoặc chưa được track và không bị ignore. Mỗi file xuất hiện một lần. Mỗi khối tiếp tục từ cùng root `fe-ecommerce-nike-style/`.

Phạm vi bỏ qua `.git`, `node_modules`, output build, cache, biến môi trường local và các file đã stage xóa. `public/sw.js` do build sinh. Mô tả ghi vai trò của file, chưa xác nhận file còn có caller trong production. Các mục xóa đề xuất nằm ở [plan clean code](storefront-clean-code-plan.md).

### Đọc cây Next.js

- `[locale]`, `[slug]`, `[id]`, `[token]` là segment động. `(shop)` và `(auth)` là nhóm layout, vắng mặt trong URL. `_lib` chứa module nội bộ theo route.
- `src/lib/api/endpoints/catalog.ts` đọc API thật qua `/api/v1`. Các mock còn lại hỗ trợ luồng chuyển tiếp. `src/app/sw.ts` phục vụ PWA và `public/mockServiceWorker.js` phục vụ MSW.

## Mã storefront

```text
fe-ecommerce-nike-style/
└── src/
    ├── __tests__/
    │   ├── helpers/
    │   │   └── render.tsx — Module phụ trách render. Ký hiệu: renderWithProviders.
    │   ├── middleware.test.ts — Vitest kiểm tra middleware / redirects to login when accessing a protected path without a token / does not touch the admin role check for non-admin protected paths.
    │   └── setup.ts — Thiết lập môi trường dùng chung của Vitest.
    ├── app/
    │   ├── [locale]/
    │   │   ├── (auth)/
    │   │   │   ├── _lib/
    │   │   │   │   ├── api/
    │   │   │   │   │   └── auth.ts — Adapter phía route gọi transport auth. Ký hiệu: loginAction, registerAction, forgotPasswordAction.
    │   │   │   │   ├── components/
    │   │   │   │   │   ├── __tests__/
    │   │   │   │   │   │   └── PasswordInput.test.tsx — Vitest kiểm tra PasswordInput / renders input with type password by default / toggle button has aria-label .
    │   │   │   │   │   ├── ApiErrorAlert.tsx — Giao diện Api lỗi Alert. Ký hiệu: ApiErrorAlert.
    │   │   │   │   │   ├── ForgotPasswordForm.tsx — Giao diện quên mật khẩu biểu mẫu. Ký hiệu: ForgotPasswordForm.
    │   │   │   │   │   ├── LoginForm.tsx — Giao diện đăng nhập biểu mẫu. Ký hiệu: LoginForm.
    │   │   │   │   │   ├── PasswordInput.tsx — Giao diện mật khẩu ô nhập liệu. Ký hiệu: PasswordInput.
    │   │   │   │   │   ├── RegisterForm.tsx — Giao diện đăng ký biểu mẫu. Ký hiệu: RegisterForm.
    │   │   │   │   │   └── ResetPasswordForm.tsx — Giao diện đặt lại mật khẩu biểu mẫu. Ký hiệu: ResetPasswordForm.
    │   │   │   │   ├── hooks/
    │   │   │   │   │   └── useApiErrorMessage.ts — Logic hook cho Api lỗi Message. Ký hiệu: useApiErrorMessage.
    │   │   │   │   └── schemas/
    │   │   │   │       └── auth.ts — Khai báo và kiểm tra dữ liệu auth. Ký hiệu: LoginFormSchema, RegisterFormSchema, ForgotPasswordFormSchema.
    │   │   │   ├── forgot-password/
    │   │   │   │   └── page.tsx — Route /{locale}/forgot-password, hiển thị quên mật khẩu.
    │   │   │   ├── layout.tsx — Layout nhóm xác thực (AuthLayout).
    │   │   │   ├── login/
    │   │   │   │   └── page.tsx — Route /{locale}/login, hiển thị đăng nhập.
    │   │   │   ├── register/
    │   │   │   │   └── page.tsx — Route /{locale}/register, hiển thị đăng ký.
    │   │   │   └── reset-password/
    │   │   │       └── [token]/
    │   │   │           └── page.tsx — Route /{locale}/reset-password/{token}, hiển thị đặt lại mật khẩu.
    │   │   ├── (shop)/
    │   │   │   ├── _lib/
    │   │   │   │   ├── api/
    │   │   │   │   │   ├── address.ts — Adapter phía route gọi transport address. Ký hiệu: addressActions.
    │   │   │   │   │   ├── checkout.ts — Adapter phía route gọi transport checkout. Ký hiệu: checkoutActions.
    │   │   │   │   │   ├── order.ts — Adapter phía route gọi transport order. Ký hiệu: orderActions, getOrderOrNull.
    │   │   │   │   │   └── profile.ts — Adapter phía route gọi transport profile. Ký hiệu: profileActions.
    │   │   │   │   ├── components/
    │   │   │   │   │   ├── addresses/
    │   │   │   │   │   │   ├── __tests__/
    │   │   │   │   │   │   │   └── AddressesClient.test.tsx — Vitest kiểm tra AddressesClient — address book CRUD (FE-INT, issue #15) / lists the seeded default address / creates a new address.
    │   │   │   │   │   │   └── AddressesClient.tsx — Giao diện sổ địa chỉ phía trình duyệt. Ký hiệu: AddressesClient.
    │   │   │   │   │   ├── cart/
    │   │   │   │   │   │   ├── CartClient.tsx — Giao diện Giỏ hàng phía trình duyệt. Ký hiệu: CartClient.
    │   │   │   │   │   │   ├── CartDrawer.tsx — Giao diện Giỏ hàng Drawer. Ký hiệu: CartDrawer.
    │   │   │   │   │   │   ├── CartSummary.tsx — Giao diện Giỏ hàng tóm tắt. Ký hiệu: CartSummary.
    │   │   │   │   │   │   └── CartTable.tsx — Giao diện Giỏ hàng Table. Ký hiệu: CartTable.
    │   │   │   │   │   ├── categories/
    │   │   │   │   │   │   ├── CategoryClient.tsx — Giao diện Danh mục phía trình duyệt. Ký hiệu: CategoryClient.
    │   │   │   │   │   │   ├── CategoryNav.tsx — Giao diện Danh mục Nav. Ký hiệu: CategoryNav.
    │   │   │   │   │   │   ├── CategoryPageClient.tsx — Giao diện Danh mục trang phía trình duyệt. Ký hiệu: CategoryPageClient.
    │   │   │   │   │   │   └── FilterSidebar.tsx — Giao diện bộ lọc Sidebar. Ký hiệu: FilterSidebar.
    │   │   │   │   │   ├── checkout/
    │   │   │   │   │   │   ├── CheckoutClient.tsx — Giao diện checkout phía trình duyệt. Ký hiệu: CheckoutClient.
    │   │   │   │   │   │   └── OrderSummary.tsx — Giao diện Đơn hàng tóm tắt. Ký hiệu: OrderSummary.
    │   │   │   │   │   ├── common/
    │   │   │   │   │   │   ├── __tests__/
    │   │   │   │   │   │   │   ├── ConfirmDialog.test.tsx — Vitest kiểm tra ConfirmDialog / renders the trigger element / dialog is not visible before trigger is clicked.
    │   │   │   │   │   │   │   ├── PriceDisplay.test.tsx — Vitest kiểm tra PriceDisplay / shows only the main price span when no sale price / shows two price spans when salePrice < price.
    │   │   │   │   │   │   │   ├── ProductCard.test.tsx — Vitest kiểm tra ProductCard / renders the product name / links to the product detail page by locale and slug.
    │   │   │   │   │   │   │   └── QuantitySelector.test.tsx — Vitest kiểm tra QuantitySelector / renders the current value / decrease button is disabled when value equals min.
    │   │   │   │   │   │   ├── CategoryCard.tsx — Giao diện Danh mục Card. Ký hiệu: CategoryCard.
    │   │   │   │   │   │   ├── ConfirmDialog.tsx — Giao diện Confirm hộp thoại. Ký hiệu: ConfirmDialog.
    │   │   │   │   │   │   ├── FlashSaleBanner.tsx — Giao diện Flash Sale Banner. Ký hiệu: FlashSaleBanner.
    │   │   │   │   │   │   ├── HeroBanner.tsx — Giao diện Hero Banner. Ký hiệu: HeroBanner.
    │   │   │   │   │   │   ├── OrderStatusBadge.tsx — Giao diện Đơn hàng Status nhãn. Ký hiệu: OrderStatusBadge.
    │   │   │   │   │   │   ├── Pagination.tsx — Giao diện phân trang. Ký hiệu: Pagination.
    │   │   │   │   │   │   ├── PriceDisplay.tsx — Giao diện giá Display. Ký hiệu: PriceDisplay.
    │   │   │   │   │   │   ├── ProductCard.tsx — Giao diện Sản phẩm Card. Ký hiệu: ProductCard.
    │   │   │   │   │   │   ├── ProductCarousel.tsx — Giao diện Sản phẩm Carousel. Ký hiệu: ProductCarousel.
    │   │   │   │   │   │   ├── QuantitySelector.tsx — Giao diện số lượng Selector. Ký hiệu: QuantitySelector.
    │   │   │   │   │   │   ├── Reveal.tsx — Giao diện Reveal. Ký hiệu: Reveal.
    │   │   │   │   │   │   └── SectionHeading.tsx — Giao diện Heading. Ký hiệu: SectionHeading.
    │   │   │   │   │   ├── home/
    │   │   │   │   │   │   ├── __tests__/
    │   │   │   │   │   │   │   ├── CountdownTimer.test.tsx — Vitest kiểm tra CountdownTimer / renders all zero values when target date has passed / renders padded time values for a future date.
    │   │   │   │   │   │   │   └── NewsletterForm.test.tsx — Vitest kiểm tra NewsletterForm / renders submit button with default label / renders submit button with custom submitLabel.
    │   │   │   │   │   │   ├── CountdownTimer.tsx — Giao diện Countdown Timer. Ký hiệu: CountdownTimer.
    │   │   │   │   │   │   ├── hero3d/
    │   │   │   │   │   │   │   ├── cssColor.ts — Giao diện css Color. Ký hiệu: readTokenColor.
    │   │   │   │   │   │   │   ├── dissolveShader.ts — Giao diện dissolve Shader. Ký hiệu: HERO_DISSOLVE_VERTEX, HERO_DISSOLVE_FRAGMENT.
    │   │   │   │   │   │   │   └── HeroSlides3D.tsx — Giao diện Hero Slides3 D. Ký hiệu: HeroSlides3DProps, HeroSlides3D.
    │   │   │   │   │   │   ├── HeroCarousel.tsx — Giao diện Hero Carousel. Ký hiệu: HeroCarousel.
    │   │   │   │   │   │   ├── motion.ts — Giao diện motion. Ký hiệu: EASE_OUT, DURATION_SLOW.
    │   │   │   │   │   │   ├── NewsletterForm.tsx — Giao diện Newsletter biểu mẫu. Ký hiệu: NewsletterForm.
    │   │   │   │   │   │   ├── plans/
    │   │   │   │   │   │   │   ├── 001-trustbadgelist-stagger.md — Tài liệu về 001 — Fold TrustBadgeList into the Hero's staggered reveal.
    │   │   │   │   │   │   │   ├── 002-section-entrance-reveal.md — Tài liệu về 002 — Add scroll-entrance reveal to the six static home sections.
    │   │   │   │   │   │   │   ├── 003-newsletterform-state-transition.md — Tài liệu về 003 — Crossfade NewsletterForm between form and success states.
    │   │   │   │   │   │   │   ├── 004-herocarousel-entrance-sync.md — Tài liệu về 004 — Sync HeroCarousel's entrance with the Hero text stagger.
    │   │   │   │   │   │   │   ├── 005-consolidate-ease-duration-literals.md — Tài liệu về 005 — Consolidate hand-typed easing/duration literals into a shared home motion constant.
    │   │   │   │   │   │   │   ├── 006-sectionhero-transform-string.md — Tài liệu về 006 — Use full transform string instead of the y shorthand in SectionHero's reveal variants.
    │   │   │   │   │   │   │   └── README.md — Tài liệu về Animation improvement plans — home components.
    │   │   │   │   │   │   ├── SectionFeaturedCategories.tsx — Giao diện Featured Categories. Ký hiệu: SectionFeaturedCategories.
    │   │   │   │   │   │   ├── SectionHero.tsx — Giao diện Hero. Ký hiệu: SectionHero.
    │   │   │   │   │   │   ├── SectionNewArrivals.tsx — Giao diện New Arrivals. Ký hiệu: SectionNewArrivals.
    │   │   │   │   │   │   ├── SectionNewsletter.tsx — Giao diện Newsletter. Ký hiệu: SectionNewsletter.
    │   │   │   │   │   │   ├── SectionTestimonials.tsx — Giao diện Testimonials. Ký hiệu: SectionTestimonials.
    │   │   │   │   │   │   ├── SectionWhyChooseUs.tsx — Giao diện Why Choose Us. Ký hiệu: SectionWhyChooseUs.
    │   │   │   │   │   │   ├── TestimonialCard.tsx — Giao diện Testimonial Card. Ký hiệu: TestimonialCard.
    │   │   │   │   │   │   └── TrustBadgeList.tsx — Giao diện Trust nhãn danh sách. Ký hiệu: TrustBadgeList.
    │   │   │   │   │   ├── layout/
    │   │   │   │   │   │   ├── Footer.tsx — Giao diện chân trang. Ký hiệu: Footer.
    │   │   │   │   │   │   ├── Header.tsx — Giao diện đầu trang. Ký hiệu: Header.
    │   │   │   │   │   │   └── PageShell.tsx — Giao diện trang Shell. Ký hiệu: PageShell.
    │   │   │   │   │   ├── navigation/
    │   │   │   │   │   │   ├── DesktopMegaMenu.tsx — Giao diện máy tính Mega menu. Ký hiệu: DesktopMegaMenu.
    │   │   │   │   │   │   └── MobileNav.tsx — Giao diện di động Nav. Ký hiệu: MobileNav.
    │   │   │   │   │   ├── orders/
    │   │   │   │   │   │   ├── __tests__/
    │   │   │   │   │   │   │   ├── OrderDetailClient.test.tsx — Vitest kiểm tra OrderDetailClient — customer-visible actions per state (FE-INT, issue #17) / shows  / actually cancels the order when clicked, then hides the button.
    │   │   │   │   │   │   │   └── OrdersClient.test.tsx — Vitest kiểm tra OrdersClient — fetches client-side (issue #16, closing the #15 SSR-auth gap) / shows the signed-in Customer’s own order history / shows an error state instead of a silent empty list when signed out.
    │   │   │   │   │   │   ├── OrderDetailClient.tsx — Giao diện Đơn hàng chi tiết phía trình duyệt. Ký hiệu: OrderDetailClient.
    │   │   │   │   │   │   └── OrdersClient.tsx — Giao diện danh sách Đơn hàng phía trình duyệt. Ký hiệu: OrdersClient.
    │   │   │   │   │   ├── products/
    │   │   │   │   │   │   ├── __tests__/
    │   │   │   │   │   │   │   └── ProductDetailTabs.test.tsx — Vitest kiểm tra ProductDetailTabs / shows the product description by default / reveals specs after activating the specs section.
    │   │   │   │   │   │   ├── AddToCartSection.tsx — Giao diện Add To Giỏ hàng phân mục. Ký hiệu: AddToCartSection.
    │   │   │   │   │   │   ├── CatalogProductGrid.tsx — Giao diện catalog Sản phẩm Grid. Ký hiệu: CatalogProductGrid.
    │   │   │   │   │   │   ├── MobileBuyBar.tsx — Giao diện di động Buy Bar. Ký hiệu: MobileBuyBar.
    │   │   │   │   │   │   ├── ProductDetailPageClient.tsx — Giao diện Sản phẩm chi tiết trang phía trình duyệt. Ký hiệu: ProductDetailPageClient.
    │   │   │   │   │   │   ├── ProductDetailTabs.tsx — Giao diện Sản phẩm chi tiết Tabs. Ký hiệu: ProductDetailTabs.
    │   │   │   │   │   │   ├── ProductGallery.tsx — Giao diện Sản phẩm Gallery. Ký hiệu: ProductGallery.
    │   │   │   │   │   │   ├── ProductInfoPanel.tsx — Giao diện Sản phẩm Info Panel. Ký hiệu: ProductInfoPanel.
    │   │   │   │   │   │   ├── ProductsClient.tsx — Giao diện danh sách Sản phẩm phía trình duyệt. Ký hiệu: ProductsClient.
    │   │   │   │   │   │   ├── ProductSkeletons.tsx — Giao diện Sản phẩm Skeletons. Ký hiệu: CatalogGridSkeleton, ProductDetailSkeleton.
    │   │   │   │   │   │   ├── ProductViewer3D.tsx — Giao diện Sản phẩm Viewer3 D. Ký hiệu: ProductViewer3D.
    │   │   │   │   │   │   └── VariantSelector.tsx — Giao diện Biến thể Selector. Ký hiệu: VariantOption, VariantSelector.
    │   │   │   │   │   ├── profile/
    │   │   │   │   │   │   ├── __tests__/
    │   │   │   │   │   │   │   └── ProfileClient.test.tsx — Vitest kiểm tra ProfileClient — profile update (FE-INT, issue #15) / prefills the form with the current profile / saves an update and reflects it back after refetch.
    │   │   │   │   │   │   └── ProfileClient.tsx — Giao diện hồ sơ Khách hàng phía trình duyệt. Ký hiệu: ProfileClient.
    │   │   │   │   │   ├── search/
    │   │   │   │   │   │   ├── __tests__/
    │   │   │   │   │   │   │   └── SearchClient.test.tsx — Vitest kiểm tra SearchClient (FE-INT-006) / renders matching products for a query term / shows an empty state for a query with no matches.
    │   │   │   │   │   │   └── SearchClient.tsx — Giao diện tìm kiếm phía trình duyệt. Ký hiệu: SearchClient.
    │   │   │   │   │   └── wishlist/
    │   │   │   │   │       ├── __tests__/
    │   │   │   │   │       │   └── WishlistClient.test.tsx — Vitest kiểm tra WishlistClient — move to cart (FE-INT, issue #14) / navigates to the PDP for a Product with a Variant, instead of guessing Color/Size / adds a Product with no Variant straight to the cart and removes it from the wishlist.
    │   │   │   │   │       └── WishlistClient.tsx — Giao diện Wishlist phía trình duyệt. Ký hiệu: WishlistClient.
    │   │   │   │   ├── constants/
    │   │   │   │   │   └── payment-config.ts — Hằng số và cấu hình payment config. Ký hiệu: PAYMENT_CONFIG, PAYMENT_LABELS.
    │   │   │   │   ├── data/
    │   │   │   │   │   └── home.ts — Dữ liệu cấu hình hiển thị cho home. Ký hiệu: placeholderImage, homeBenefitsData, homeHeroData.
    │   │   │   │   ├── hooks/
    │   │   │   │   │   ├── __tests__/
    │   │   │   │   │   │   ├── useCart.test.tsx — Vitest kiểm tra useCart (FE-INT — add/update/delete/rollback, issue #13) / adds a SKU to an empty cart and resolves its live price/stock for display / sums quantity when adding the same SKU twice, within stock.
    │   │   │   │   │   │   └── useWishlist.test.tsx — Vitest kiểm tra useIsWishlisted (FE-INT — toggle on ProductCard, issue #14) / starts un-wishlisted and toggles on / toggles off a wishlisted product without touching others.
    │   │   │   │   │   ├── addresses/
    │   │   │   │   │   │   ├── addressKeys.ts — Query keys dùng cho address Keys. Ký hiệu: addressKeys.
    │   │   │   │   │   │   ├── useAddresses.ts — Logic hook cho sổ địa chỉ. Ký hiệu: useAddresses.
    │   │   │   │   │   │   ├── useAddressForm.ts — Logic hook cho địa chỉ giao hàng biểu mẫu. Ký hiệu: useAddressForm.
    │   │   │   │   │   │   ├── useDeleteAddress.ts — Logic hook cho xóa địa chỉ giao hàng. Ký hiệu: useDeleteAddress.
    │   │   │   │   │   │   ├── useSaveAddress.ts — Logic hook cho lưu địa chỉ giao hàng. Ký hiệu: useSaveAddress.
    │   │   │   │   │   │   └── useSetDefaultAddress.ts — Logic hook cho Set mặc định địa chỉ giao hàng. Ký hiệu: useSetDefaultAddress.
    │   │   │   │   │   ├── categories/
    │   │   │   │   │   │   ├── useCatalogFilterControls.ts — Logic hook cho catalog bộ lọc Controls. Ký hiệu: useCatalogFilterControls.
    │   │   │   │   │   │   ├── useCatalogOptions.ts — Logic hook cho catalog Options. Ký hiệu: useCatalogOptions.
    │   │   │   │   │   │   └── useCategoryTree.ts — Logic hook cho Danh mục Tree. Ký hiệu: useCategoryTree.
    │   │   │   │   │   ├── checkout/
    │   │   │   │   │   │   ├── __tests__/
    │   │   │   │   │   │   │   ├── checkout-flow.test.tsx — Vitest kiểm tra Reservation (FE-INT, issue #16) / reserves stock and reduces what other requests see as available / refuses a reservation that exceeds available stock.
    │   │   │   │   │   │   │   └── useReservation.test.tsx — Vitest kiểm tra useReservation (checkout, issue #16) / stays idle (no reservationId, not pending) for an empty cart / reserves the given items exactly once and resolves a reservationId.
    │   │   │   │   │   │   ├── useCheckoutForm.ts — Logic hook cho checkout biểu mẫu. Ký hiệu: useCheckoutForm.
    │   │   │   │   │   │   ├── useCreateOrder.ts — Logic hook cho tạo Đơn hàng. Ký hiệu: useCreateOrder.
    │   │   │   │   │   │   ├── useRedirectIfCartEmpty.ts — Logic hook cho chuyển hướng If Giỏ hàng trống. Ký hiệu: useRedirectIfCartEmpty.
    │   │   │   │   │   │   └── useReservation.ts — Logic hook cho Giữ hàng. Ký hiệu: useReservation.
    │   │   │   │   │   ├── home/
    │   │   │   │   │   │   ├── useHomeFlashSaleCountdown.ts — Logic hook cho trang chủ Flash Sale Countdown. Ký hiệu: useHomeFlashSaleCountdown.
    │   │   │   │   │   │   └── useNewsletterForm.ts — Logic hook cho Newsletter biểu mẫu. Ký hiệu: useNewsletterForm.
    │   │   │   │   │   ├── orders/
    │   │   │   │   │   │   ├── __tests__/
    │   │   │   │   │   │   │   ├── order-lifecycle.test.tsx — Vitest kiểm tra Cancel — valid/invalid transitions from the Customer view (FE-INT, issue #17) / cancels a PENDING order / cancels a PROCESSING order.
    │   │   │   │   │   │   │   └── useOrders.test.tsx — Vitest kiểm tra Order history — ownership (FE-INT, issue #15) / lists only the signed-in Customer’s own orders / resolves the detail of an order the Customer owns.
    │   │   │   │   │   │   ├── orderKeys.ts — Query keys dùng cho order Keys. Ký hiệu: orderKeys.
    │   │   │   │   │   │   ├── useCancelOrder.ts — Logic hook cho hủy Đơn hàng. Ký hiệu: useCancelOrder.
    │   │   │   │   │   │   ├── useOrder.ts — Logic hook cho Đơn hàng. Ký hiệu: useOrder.
    │   │   │   │   │   │   ├── useOrders.ts — Logic hook cho danh sách Đơn hàng. Ký hiệu: useOrders.
    │   │   │   │   │   │   └── useRequestReturn.ts — Logic hook cho Request đổi trả. Ký hiệu: useRequestReturn.
    │   │   │   │   │   ├── products/
    │   │   │   │   │   │   ├── catalogKeys.ts — Query keys dùng cho catalog Keys. Ký hiệu: catalogKeys.
    │   │   │   │   │   │   ├── useCatalogListing.ts — Logic hook cho catalog Listing. Ký hiệu: useCatalogListing.
    │   │   │   │   │   │   ├── useProduct.ts — Logic hook cho Sản phẩm. Ký hiệu: useProduct.
    │   │   │   │   │   │   ├── useProducts.ts — Logic hook cho danh sách Sản phẩm. Ký hiệu: useProducts.
    │   │   │   │   │   │   ├── useProductSearch.ts — Logic hook cho Sản phẩm tìm kiếm. Ký hiệu: useProductSearch.
    │   │   │   │   │   │   ├── useProductSearchListing.ts — Logic hook cho Sản phẩm tìm kiếm Listing. Ký hiệu: useProductSearchListing.
    │   │   │   │   │   │   ├── useRelatedProducts.ts — Logic hook cho liên quan danh sách Sản phẩm. Ký hiệu: useRelatedProducts.
    │   │   │   │   │   │   └── useVariantSelection.ts — Logic hook cho Biến thể Selection. Ký hiệu: useVariantSelection, VariantSelectionState.
    │   │   │   │   │   ├── profile/
    │   │   │   │   │   │   ├── useProfile.ts — Logic hook cho hồ sơ Khách hàng. Ký hiệu: useProfile.
    │   │   │   │   │   │   ├── useProfileForm.ts — Logic hook cho hồ sơ Khách hàng biểu mẫu. Ký hiệu: useProfileForm.
    │   │   │   │   │   │   └── useUpdateProfile.ts — Logic hook cho cập nhật hồ sơ Khách hàng. Ký hiệu: useUpdateProfile.
    │   │   │   │   │   ├── useCart.ts — Logic hook cho Giỏ hàng. Ký hiệu: CartItem, CartLine, useCartStore.
    │   │   │   │   │   ├── useHeaderSearch.ts — Logic hook cho đầu trang tìm kiếm. Ký hiệu: useHeaderSearch.
    │   │   │   │   │   ├── useMergeGuestDataOnLogin.ts — Logic hook cho gộp Khách vãng lai Data On đăng nhập. Ký hiệu: useMergeGuestDataOnLogin.
    │   │   │   │   │   ├── useWishlist.ts — Logic hook cho Wishlist. Ký hiệu: WishlistItem, useWishlistStore, resetWishlistState.
    │   │   │   │   │   └── wishlist/
    │   │   │   │   │       └── useMoveToCart.ts — Logic hook cho Move To Giỏ hàng. Ký hiệu: useMoveToCart.
    │   │   │   │   ├── schemas/
    │   │   │   │   │   ├── address.ts — Khai báo và kiểm tra dữ liệu address. Ký hiệu: addressFormSchema, AddressFormInput.
    │   │   │   │   │   ├── checkout.ts — Khai báo và kiểm tra dữ liệu checkout. Ký hiệu: addressSchema, shippingMethodSchema, paymentMethodSchema.
    │   │   │   │   │   ├── filter.ts — Khai báo và kiểm tra dữ liệu filter. Ký hiệu: filterSchema, FilterInput.
    │   │   │   │   │   └── profile.ts — Khai báo và kiểm tra dữ liệu profile. Ký hiệu: profileSchema, ProfileInput.
    │   │   │   │   ├── types/
    │   │   │   │   │   └── home.ts — Kiểu dữ liệu home. Ký hiệu: HomeBenefit, HomeHero, HomeTestimonial.
    │   │   │   │   └── utils/
    │   │   │   │       ├── __tests__/
    │   │   │   │       │   ├── catalogUrlState.test.ts — Vitest kiểm tra parseCatalogFilters (FE-UNIT-001) / defaults to sortBy=newest and page=1 when the query string is empty / round-trips a normal query string.
    │   │   │   │       │   ├── discount.test.ts — Vitest kiểm tra calculateDiscountPercent / returns rounded discount percent / returns zero when discounted price is not lower.
    │   │   │   │       │   ├── priceRange.test.ts — Vitest kiểm tra getProductPriceRange / is not a range when the Product has a single SKU / is not a range when every SKU shares the same price.
    │   │   │   │       │   ├── variantColor.test.ts — Vitest kiểm tra getVariantColorHex / maps a known color name to its hex value / is case-insensitive.
    │   │   │   │       │   └── variantResolution.test.ts — Vitest kiểm tra getVariantAxes (FE-UNIT-002) / reports no axes for a Product with no Variant / reports both axes for a Color x Size Variant, deduped and in first-seen order.
    │   │   │   │       ├── catalogUrlState.ts — Hàm hỗ trợ catalog Url State. Ký hiệu: Gender, CatalogSort, CatalogFilters.
    │   │   │   │       ├── categoryTree.ts — Hàm hỗ trợ category Tree. Ký hiệu: flattenCategories.
    │   │   │   │       ├── discount.ts — Hàm hỗ trợ discount. Ký hiệu: calculateDiscountPercent, DiscountInfo, resolveDiscount.
    │   │   │   │       ├── priceRange.ts — Hàm hỗ trợ price Range. Ký hiệu: PriceRange, getProductPriceRange.
    │   │   │   │       ├── variantColor.ts — Hàm hỗ trợ variant Color. Ký hiệu: getVariantColorHex.
    │   │   │   │       └── variantResolution.ts — Hàm hỗ trợ variant Resolution. Ký hiệu: VariantAxes, VariantSelection, getVariantAxes.
    │   │   │   ├── account/
    │   │   │   │   ├── addresses/
    │   │   │   │   │   └── page.tsx — Route /{locale}/account/addresses, hiển thị sổ địa chỉ.
    │   │   │   │   ├── layout.tsx — Layout storefront /{locale}/account (AccountLayout).
    │   │   │   │   ├── orders/
    │   │   │   │   │   ├── [id]/
    │   │   │   │   │   │   └── page.tsx — Route /{locale}/account/orders/{id}, hiển thị Đơn hàng chi tiết.
    │   │   │   │   │   └── page.tsx — Route /{locale}/account/orders, hiển thị danh sách Đơn hàng.
    │   │   │   │   └── profile/
    │   │   │   │       └── page.tsx — Route /{locale}/account/profile, hiển thị hồ sơ Khách hàng.
    │   │   │   ├── cart/
    │   │   │   │   └── page.tsx — Route /{locale}/cart, hiển thị Giỏ hàng.
    │   │   │   ├── categories/
    │   │   │   │   └── [slug]/
    │   │   │   │       └── page.tsx — Route /{locale}/categories/{slug}, hiển thị Danh mục.
    │   │   │   ├── checkout/
    │   │   │   │   ├── layout.tsx — Layout storefront /{locale}/checkout (CheckoutLayout).
    │   │   │   │   ├── page.tsx — Route /{locale}/checkout, hiển thị checkout.
    │   │   │   │   └── success/
    │   │   │   │       └── page.tsx — Route /{locale}/checkout/success, hiển thị checkout thành công.
    │   │   │   ├── home/
    │   │   │   │   └── page.tsx — Route /{locale}/home, hiển thị trang chủ.
    │   │   │   ├── layout.tsx — Layout storefront /{locale} (ShopLayout).
    │   │   │   ├── page.tsx — Redirect /{locale} sang /{locale}/home.
    │   │   │   ├── products/
    │   │   │   │   ├── [slug]/
    │   │   │   │   │   └── page.tsx — Route /{locale}/products/{slug}, hiển thị Sản phẩm chi tiết.
    │   │   │   │   └── page.tsx — Route /{locale}/products, hiển thị danh sách Sản phẩm.
    │   │   │   ├── search/
    │   │   │   │   └── page.tsx — Route /{locale}/search, hiển thị tìm kiếm.
    │   │   │   └── wishlist/
    │   │   │       └── page.tsx — Route /{locale}/wishlist, hiển thị Wishlist.
    │   │   ├── error.tsx — Error boundary khi render route locale.
    │   │   ├── layout.tsx — Layout locale /{locale} (LocaleLayout).
    │   │   └── loading.tsx — Giao diện chờ cho route locale.
    │   ├── ~offline/
    │   │   └── page.tsx — Trang fallback khi điều hướng trong chế độ offline.
    │   ├── favicon.ico — Favicon được Next nhận theo file convention.
    │   ├── globals.css — CSS toàn cục và điểm nạp stylesheet của app.
    │   ├── layout.tsx — Root layout đặt font, metadata, HTML lang và gắn providers.
    │   ├── not-found.tsx — Giao diện khi route hoặc tài nguyên không tồn tại.
    │   ├── opengraph-image.tsx — Sinh ảnh Open Graph theo file convention Next.js.
    │   ├── page.tsx — Redirect / sang /vi.
    │   ├── providers.tsx — Lắp Query, theme, toast, motion và auth runtime cho app.
    │   └── sw.ts — Mã nguồn worker Serwist, build ra public/sw.js, fallback tài liệu về /~offline.
    ├── components/
    │   └── ui/
    │       ├── Accordion.tsx — UI primitive cho các mục mở/đóng.
    │       ├── Badge.tsx — UI primitive cho nhãn.
    │       ├── Button.tsx — UI primitive cho nút. Ký hiệu: ButtonProps, Button.
    │       ├── Checkbox.tsx — UI primitive cho ô đánh dấu.
    │       ├── Dialog.tsx — UI primitive cho hộp thoại.
    │       ├── DropdownMenu.tsx — UI primitive cho thả xuống menu.
    │       ├── Form.tsx — UI primitive cho biểu mẫu.
    │       ├── Input.tsx — UI primitive cho ô nhập liệu. Ký hiệu: InputProps, Input.
    │       ├── Label.tsx — UI primitive cho Label. Ký hiệu: Label.
    │       ├── Popover.tsx — UI primitive cho panel nổi.
    │       ├── ScrollArea.tsx — UI primitive cho cuộn Area.
    │       ├── Select.tsx — UI primitive cho chọn.
    │       ├── Separator.tsx — UI primitive cho đường phân cách.
    │       ├── Sheet.tsx — UI primitive cho panel trượt.
    │       ├── Skeleton.tsx — UI primitive cho khung chờ.
    │       ├── SocialMarks.tsx — UI primitive cho Social Marks. Ký hiệu: FacebookMark, TwitterMark, GoogleMark.
    │       └── Tooltip.tsx — UI primitive cho chú thích nổi.
    ├── core/
    │   └── session/
    │       ├── __tests__/
    │       │   ├── auth-store.test.ts — Vitest kiểm tra bootstrapAuth / short-circuits to anonymous without calling the network when there is no refresh token in memory / sets status to authenticated when a refresh token is present and both refresh and profile fetch succeed.
    │       │   ├── roles.test.ts — Vitest kiểm tra isAdminRole / returns true for admin / returns true for staff.
    │       │   └── useAuth.test.ts — Vitest kiểm tra useAuth / returns logged out state by default / updates auth state after login.
    │       ├── auth-store.ts — Lưu phiên phía client, bootstrap, refresh và xóa phiên.
    │       ├── AuthGuard.tsx — Module phụ trách phiên Người mua Guard. Ký hiệu: AuthGuard.
    │       ├── AuthRuntimeProvider.tsx — Đăng ký adapter auth cho HTTP client trước bootstrap phiên.
    │       ├── roles.ts — Nhận diện role Admin/Staff trong logic session legacy.
    │       └── useAuth.ts — Module phụ trách phiên Người mua. Ký hiệu: login, useIsLoggedIn, useAuth.
    ├── i18n/
    │   ├── __tests__/
    │   │   ├── create-request-config.test.ts — Vitest kiểm tra createRequestConfig / falls back to the default locale when requestLocale resolves to undefined / merges every module message under its own key for the resolved locale.
    │   │   └── locales.test.ts — Vitest kiểm tra isLocale / accepts every configured locale / rejects a locale that is not configured.
    │   ├── create-request-config.ts — Module phụ trách create request config. Ký hiệu: LoadMessages, RequestConfigParams, RequestConfigResult.
    │   ├── locales.ts — Module phụ trách locales. Ký hiệu: LOCALES, Locale, DEFAULT_LOCALE.
    │   └── request.ts — Nạp message theo locale cho next-intl.
    ├── instrumentation.node.ts — Khởi tạo MSW phía server Node khi bật mock.
    ├── instrumentation.ts — Next hook khởi tạo instrumentation theo runtime.
    ├── lang/
    │   ├── en/
    │   │   ├── address.json — Bản dịch tiếng Anh cho address.
    │   │   ├── auth.json — Bản dịch tiếng Anh cho auth.
    │   │   ├── cart.json — Bản dịch tiếng Anh cho cart.
    │   │   ├── checkout.json — Bản dịch tiếng Anh cho checkout.
    │   │   ├── common.json — Bản dịch tiếng Anh cho common.
    │   │   ├── home.json — Bản dịch tiếng Anh cho home.
    │   │   ├── order.json — Bản dịch tiếng Anh cho order.
    │   │   ├── payment.json — Bản dịch tiếng Anh cho payment.
    │   │   ├── product.json — Bản dịch tiếng Anh cho product.
    │   │   ├── profile.json — Bản dịch tiếng Anh cho profile.
    │   │   └── wishlist.json — Bản dịch tiếng Anh cho wishlist.
    │   └── vi/
    │       ├── address.json — Bản dịch tiếng Việt cho address.
    │       ├── auth.json — Bản dịch tiếng Việt cho auth.
    │       ├── cart.json — Bản dịch tiếng Việt cho cart.
    │       ├── checkout.json — Bản dịch tiếng Việt cho checkout.
    │       ├── common.json — Bản dịch tiếng Việt cho common.
    │       ├── home.json — Bản dịch tiếng Việt cho home.
    │       ├── order.json — Bản dịch tiếng Việt cho order.
    │       ├── payment.json — Bản dịch tiếng Việt cho payment.
    │       ├── product.json — Bản dịch tiếng Việt cho product.
    │       ├── profile.json — Bản dịch tiếng Việt cho profile.
    │       └── wishlist.json — Bản dịch tiếng Việt cho wishlist.
    ├── lib/
    │   ├── api/
    │   │   ├── adapters/
    │   │   │   ├── __tests__/
    │   │   │   │   └── server.test.ts — Vitest kiểm tra enableApiMockingServer / boots the MSW node server and intercepts matching requests when mocking is enabled / does nothing when mocking is disabled.
    │   │   │   ├── browser.ts — Khởi động mock adapter cho trình duyệt.
    │   │   │   └── server.ts — Khởi động mock adapter cho server.
    │   │   ├── client/
    │   │   │   ├── __tests__/
    │   │   │   │   └── api-error.test.ts — Vitest kiểm tra ApiError.fromResponse / parses a response matching the shared error envelope / carries optional details through.
    │   │   │   ├── api-error.ts — Module phụ trách api error. Ký hiệu: ApiError.
    │   │   │   ├── fetcher.ts — HTTP client Axios, parse response, chuẩn hóa lỗi và retry sau refresh.
    │   │   │   └── runtime.ts — Module phụ trách runtime. Ký hiệu: AuthRuntimeAdapter, registerAuthRuntimeAdapter, getAuthRuntimeAdapter.
    │   │   ├── endpoints/
    │   │   │   ├── __tests__/
    │   │   │   │   ├── auth.test.ts — Vitest kiểm tra register / creates a session for a new email / rejects a duplicate email.
    │   │   │   │   ├── cart.test.ts — Vitest kiểm tra getSkusByIds / resolves live price/stock/display data for known SKUs / silently drops unknown SKU ids.
    │   │   │   │   └── order-transitions.test.ts — Vitest kiểm tra canCancelOrder / canRequestReturn / refuses when the order was never DELIVERED.
    │   │   │   ├── address.ts — Transport cho address. Ký hiệu: StorefrontAddress, StorefrontAddressInput, getAddresses.
    │   │   │   ├── auth.ts — Transport cho auth. Ký hiệu: AuthUser, LoginPayload, RegisterPayload.
    │   │   │   ├── cart.ts — Transport cho cart. Ký hiệu: ResolvedCartLine, ResolvedCartLineWithQuantity, getSkusByIds.
    │   │   │   ├── catalog.ts — Đọc catalog thật và chuyển DTO thành model hiển thị.
    │   │   │   ├── checkout.ts — Transport cho checkout. Ký hiệu: ReservationItem, Reservation, createReservation.
    │   │   │   ├── order-transitions.ts — Transport cho order transitions. Ký hiệu: RETURN_WINDOW_MS, canCancelOrder, isWithinReturnWindow.
    │   │   │   ├── orders.ts — Transport cho orders. Ký hiệu: StorefrontOrder, StorefrontOrderStatus, StorefrontPaymentMethod.
    │   │   │   ├── profile.ts — Transport cho profile. Ký hiệu: StorefrontProfile, getProfile, updateProfile.
    │   │   │   └── wishlist.ts — Transport cho wishlist. Ký hiệu: getProductsByIds, mergeWishlistAfterLogin.
    │   │   ├── env/
    │   │   │   └── config.ts — Module phụ trách config. Ký hiệu: IS_API_MOCKING, API_BASE_URL.
    │   │   ├── generated/
    │   │   │   └── openapi.ts — Types sinh từ OpenAPI đã pin. Nguồn sửa là hợp đồng và generator.
    │   │   ├── mocks/
    │   │   │   ├── __tests__/
    │   │   │   │   ├── auth-fixtures.test.ts — Vitest kiểm tra createSession / access token / issues an access token that decodes to the user id and expires ACCESS_TOKEN_TTL_MS later / findUserByAccessToken resolves the user for a valid, unexpired Bearer token.
    │   │   │   │   └── search-match.test.ts — Vitest kiểm tra normalizeSearchText / strips Vietnamese diacritics and lowercases / maps đ/Đ to d, which NFD decomposition does not handle on its own.
    │   │   │   ├── address-fixtures.ts — Dữ liệu hoặc hành vi mô phỏng cho address. Ký hiệu: resetMockAddressDbForTesting, getAddresses, createAddress.
    │   │   │   ├── auth-fixtures.ts — Dữ liệu hoặc hành vi mô phỏng cho auth. Ký hiệu: ACCESS_TOKEN_TTL_MS, REFRESH_IDLE_TTL_MS, REFRESH_ABSOLUTE_TTL_MS.
    │   │   │   ├── cart-fixtures.ts — Dữ liệu hoặc hành vi mô phỏng cho cart. Ký hiệu: ResolvedSku, resolveSkus, getSkuStock.
    │   │   │   ├── catalog-fixtures.ts — Dữ liệu catalog mô phỏng còn được các luồng Giỏ hàng, Wishlist và checkout dùng.
    │   │   │   ├── handlers.ts — Khai báo route MSW cho luồng storefront chuyển tiếp.
    │   │   │   ├── order-fixtures.ts — Dữ liệu hoặc hành vi mô phỏng cho order. Ký hiệu: getAccountOrders, getAccountOrder, isSkuReferencedInAnyOrder.
    │   │   │   ├── reservation-fixtures.ts — Dữ liệu hoặc hành vi mô phỏng cho reservation. Ký hiệu: RESERVATION_TTL_MS, ReservationItem, getReservedQuantity.
    │   │   │   ├── search-match.ts — Dữ liệu hoặc hành vi mô phỏng cho search match. Ký hiệu: normalizeSearchText, matchesSearchQuery.
    │   │   │   └── wishlist-fixtures.ts — Dữ liệu hoặc hành vi mô phỏng cho wishlist. Ký hiệu: resolveProducts, getAccountWishlist, mergeAccountWishlist.
    │   │   ├── models/
    │   │   │   └── catalog.ts — Kiểu dữ liệu catalog hướng tới UI.
    │   │   └── testing/
    │   │       ├── msw-browser.ts — Thiết lập MSW cho trình duyệt.
    │   │       └── msw-server.ts — Thiết lập MSW cho Node.js.
    │   └── schemas/
    │       ├── address/
    │       │   └── address.ts — Khai báo và kiểm tra dữ liệu address. Ký hiệu: AddressSchema, AddressListSchema, AddressInputSchema.
    │       ├── auth/
    │       │   └── auth.ts — Khai báo và kiểm tra dữ liệu auth. Ký hiệu: AuthSessionResponseSchema, RefreshSessionResponseSchema, AuthSessionResponse.
    │       ├── cart/
    │       │   └── cart.ts — Khai báo và kiểm tra dữ liệu cart. Ký hiệu: CartItemSchema, CartItem.
    │       ├── catalog/
    │       │   ├── __tests__/
    │       │   │   └── catalog.test.ts — Vitest kiểm tra ProductSchema / accepts a product with at least one SKU and a gender / rejects a product with no SKUs (every Product maps to >=1 SKU, even without a Variant).
    │       │   └── catalog.ts — Zod contract catalog cũ cho dữ liệu chuyển tiếp.
    │       ├── common/
    │       │   ├── __tests__/
    │       │   │   └── pagination.test.ts — Vitest kiểm tra PaginationQuerySchema / defaults page to 1 and pageSize to 20 when omitted / rejects a page below 1.
    │       │   └── pagination.ts — Khai báo và kiểm tra dữ liệu pagination. Ký hiệu: PaginationQuerySchema, PaginationMetaSchema, PaginationQuery.
    │       ├── errors/
    │       │   ├── __tests__/
    │       │   │   └── envelope.test.ts — Vitest kiểm tra ErrorEnvelopeSchema / accepts a valid error envelope / accepts optional details.
    │       │   └── envelope.ts — Khai báo và kiểm tra dữ liệu envelope. Ký hiệu: ErrorEnvelopeSchema, ErrorEnvelope.
    │       ├── order/
    │       │   └── order.ts — Khai báo và kiểm tra dữ liệu order. Ký hiệu: OrderStatusSchema, OrderPaymentMethodSchema, OrderPaymentStatusSchema.
    │       ├── profile/
    │       │   └── profile.ts — Khai báo và kiểm tra dữ liệu profile. Ký hiệu: ProfileSchema, ProfileUpdateInputSchema, Profile.
    │       └── wishlist/
    │           └── wishlist.ts — Khai báo và kiểm tra dữ liệu wishlist. Ký hiệu: WishlistItemSchema, WishlistItem.
    ├── middleware.ts — Xử lý locale và redirect theo phiên đăng nhập, còn nhánh Admin legacy.
    ├── shared/
    │   ├── components/
    │   │   ├── ErrorState.tsx — Giao diện lỗi State. Ký hiệu: ErrorState.
    │   │   ├── LoadingSpinner.tsx — Giao diện đang tải Spinner. Ký hiệu: LoadingSpinner.
    │   │   ├── PageLoader.tsx — Giao diện trang Loader. Ký hiệu: PageLoader.
    │   │   └── QueryState.tsx — Giao diện Query State. Ký hiệu: QueryState.
    │   ├── constants/
    │   │   ├── app-config.ts — Hằng số và cấu hình app config. Ký hiệu: APP_CONFIG, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL.
    │   │   ├── auth-cookies.ts — Tên cookie is_admin mà middleware legacy đọc.
    │   │   ├── query-keys.ts — Hằng số và cấu hình query keys. Ký hiệu: QUERY_KEYS.
    │   │   └── routes.ts — Hằng số và cấu hình routes. Ký hiệu: ROUTES.
    │   ├── hooks/
    │   │   ├── __tests__/
    │   │   │   ├── useCanRender3D.test.ts — Vitest kiểm tra useCanRender3D / starts pending before any gate has resolved / reaches ready on an unconstrained desktop once the idle slot fires.
    │   │   │   ├── useLocalStorage.test.ts — Vitest kiểm tra useLocalStorage / returns the initial value when key is not set / reads an existing value from localStorage on mount.
    │   │   │   ├── useMediaQuery.test.ts — Vitest kiểm tra useMediaQuery / returns false when the media query does not match / returns true when the media query matches.
    │   │   │   └── usePagination.test.ts — Vitest kiểm tra usePagination / starts at page 1 and calculates total pages / clamps page to the valid range.
    │   │   ├── useCanRender3D.ts — Logic hook cho Can Render3 D. Ký hiệu: Render3DStatus, Render3DTier, CanRender3D.
    │   │   ├── useLocalStorage.ts — Logic hook cho Local Storage. Ký hiệu: useLocalStorage.
    │   │   ├── useMediaQuery.ts — Logic hook cho Media Query. Ký hiệu: useMediaQuery, useIsMobile, useIsTablet.
    │   │   └── usePagination.ts — Logic hook cho phân trang. Ký hiệu: PaginationResult, usePagination.
    │   ├── lib/
    │   │   ├── __tests__/
    │   │   │   ├── api-error.test.ts — Vitest kiểm tra ApiError / is an instance of Error with name ApiError / stores status, code, and details.
    │   │   │   ├── cloudinary.test.ts — Vitest kiểm tra buildImageUrl / returns placeholder for empty publicId / builds URL with default transforms.
    │   │   │   ├── notification.test.ts — Vitest kiểm tra notify / delegates success notifications to sonner / delegates error notifications to sonner.
    │   │   │   ├── seo.test.ts — Vitest kiểm tra buildMetadata / formats title with site name / includes description when provided.
    │   │   │   └── utils.test.ts — Vitest kiểm tra cn / merges tailwind classes, last wins on conflict / filters falsy values.
    │   │   ├── api-mocking.ts — Module phụ trách api mocking. Ký hiệu: ensureApiMockingReady.
    │   │   ├── cloudinary.ts — Module phụ trách cloudinary. Ký hiệu: buildImageUrl.
    │   │   ├── env.ts — Module phụ trách env. Ký hiệu: env.
    │   │   ├── errors/
    │   │   │   ├── api-error.ts — Điểm tái xuất lỗi API cho consumer trong shared.
    │   │   │   └── error-codes.ts — Module phụ trách error codes. Ký hiệu: ERROR_CODES, ErrorCode.
    │   │   ├── focusRing.ts — Module phụ trách focus Ring. Ký hiệu: focusRing.
    │   │   ├── hooks/
    │   │   │   ├── __tests__/
    │   │   │   │   ├── createPersistedListStore.test.tsx — Vitest kiểm tra createPersistedListStore / reads [] when nothing is persisted yet / round-trips items written and read back under the same version.
    │   │   │   │   └── useApiMutation.test.tsx — Vitest kiểm tra useApiMutation (issue: double toast on mutation failure) / toasts the ApiError message on failure — exactly once / falls back to errorFallback for a non-ApiError failure — exactly once.
    │   │   │   ├── createPersistedListStore.ts — Logic hook cho create Persisted danh sách Store. Ký hiệu: createPersistedListStore.
    │   │   │   └── useApiMutation.ts — Logic hook cho Api Mutation. Ký hiệu: useApiMutation.
    │   │   ├── mock-content.ts — Module phụ trách mock content. Ký hiệu: isMockContentEnabled.
    │   │   ├── monitoring/
    │   │   │   └── sentry.ts — Module phụ trách sentry. Ký hiệu: captureError.
    │   │   ├── motion.ts — Module phụ trách motion. Ký hiệu: SPRING_UI, SPRING_MOVE, SPRING_MOMENTUM.
    │   │   ├── notification.ts — Module phụ trách notification. Ký hiệu: NotifyOptions, notify.
    │   │   ├── query-client.ts — Module phụ trách query client. Ký hiệu: makeQueryClient.
    │   │   ├── seo.ts — Module phụ trách seo. Ký hiệu: buildMetadata.
    │   │   └── utils.ts — Module phụ trách utils. Ký hiệu: cn, formatCurrency, formatDate.
    │   └── types/
    │       ├── address.ts — Kiểu dữ liệu address. Ký hiệu: ShippingAddressSchema, ShippingAddress.
    │       ├── filter.ts — Kiểu dữ liệu filter. Ký hiệu: ProductFilterSchema, ProductFilter.
    │       ├── order.ts — Kiểu dữ liệu order. Ký hiệu: Order, OrderStatus.
    │       ├── product.ts — Kiểu dữ liệu product. Ký hiệu: BadgeValue.
    │       └── user.ts — Kiểu dữ liệu user. Ký hiệu: User, LoginSchema, RegisterSchema.
    └── styles/
        ├── login.css — Style và animation cho màn hình đăng nhập.
        ├── preset.css — Điểm cấu hình scan nguồn CSS Tailwind.
        └── theme.css — Design tokens và biến CSS toàn storefront.
```

## Kiểm thử trình duyệt và tài nguyên public

```text
fe-ecommerce-nike-style/
├── e2e/
│   ├── auth.spec.ts — Playwright kiểm tra Auth (register/login/forgot-reset) / register → login → forgot password → reset → login again with the new password.
│   ├── cart.spec.ts — Playwright kiểm tra Cart (guest + merge + rollback) / merges the guest cart into the account cart on login, summing the colliding SKU (Decision #36) / guest can add/update/remove cart items without logging in.
│   ├── catalog.spec.ts — Playwright kiểm tra Catalog browse (PLP + Category + Gender filter) / gender filter, sort, and pagination reflect on the URL and survive a reload / Category tree renders the Decision #50 taxonomy and links into a Category page.
│   ├── checkout.spec.ts — Playwright kiểm tra Checkout COD (reservation + idempotent place order + success) — FE-E2E-001 / browse → PDP → cart → checkout COD → order success.
│   ├── hero-3d.spec.ts — Playwright kiểm tra Hero WebGL slides / with reduced motion / never loads the WebGL layer and leaves the carousel usable.
│   ├── home.spec.ts — Playwright kiểm tra Homepage smoke / renders hero, primary CTA, and footer / primary CTA navigates to the product listing.
│   ├── pdp.spec.ts — Playwright kiểm tra PDP (Variant to SKU + 3D viewer) / a Product with a Variant requires Color+Size before price/stock resolve and Add to cart enables / a Product with no Variant skips selection — Add to cart is enabled immediately.
│   └── search.spec.ts — Playwright kiểm tra Search (basic keyword search) / header search input navigates to results and lists matching products / a query missing Vietnamese diacritics still finds the (accented) product.
└── public/
    ├── file.svg — SVG mẫu công khai (file), ứng viên rà tham chiếu trong plan cleanup.
    ├── globe.svg — SVG mẫu công khai (globe), ứng viên rà tham chiếu trong plan cleanup.
    ├── icons/
    │   ├── icon-192x192.png — Icon cài đặt PWA, kích thước 192x192 px.
    │   └── icon-512x512.png — Icon cài đặt PWA, kích thước 512x512 px.
    ├── images/
    │   ├── categories/
    │   │   ├── ao.jpg — Ảnh tĩnh công khai cho Danh mục áo.
    │   │   ├── giay.jpg — Ảnh tĩnh công khai cho Danh mục giày.
    │   │   ├── phu-kien.jpg — Ảnh tĩnh công khai cho Danh mục phụ kiện.
    │   │   ├── quan.jpg — Ảnh tĩnh công khai cho Danh mục quần.
    │   │   ├── sale.jpg — Ảnh tĩnh công khai cho Danh mục ưu đãi.
    │   │   └── tui.jpg — Ảnh tĩnh công khai cho Danh mục túi.
    │   ├── hero-placeholder.jpg — Ảnh tĩnh công khai cho hero dự phòng.
    │   └── products/
    │       └── placeholder.jpg — Ảnh tĩnh công khai cho Sản phẩm dự phòng.
    ├── manifest.json — Manifest PWA, chứa tên ứng dụng và metadata cài đặt.
    ├── mockServiceWorker.js — Service worker MSW chặn request mock trong trình duyệt.
    ├── next.svg — SVG mẫu công khai (next), ứng viên rà tham chiếu trong plan cleanup.
    ├── vercel.svg — SVG mẫu công khai (vercel), ứng viên rà tham chiếu trong plan cleanup.
    └── window.svg — SVG mẫu công khai (window), ứng viên rà tham chiếu trong plan cleanup.
```

## Tài liệu và hướng dẫn agent

```text
fe-ecommerce-nike-style/
├── docs/
│   ├── adr/
│   │   ├── 0001-single-repo-khong-monorepo.md — Hồ sơ quyết định về Giữ single-repo, không tách Turborepo monorepo.
│   │   ├── 0001-tailadmin-reuse-no-attribution.md — Hồ sơ quyết định về Admin visual redesign reuses TailAdmin Free markup/tokens without a THIRD-PARTY-NOTICES file.
│   │   ├── 0002-headless-cms-thay-vi-tu-xay.md — Hồ sơ quyết định về Dùng headless CMS bên thứ ba thay vì tự xây CMS.
│   │   └── 0003-mock-first-cho-module-chua-co-backend.md — Hồ sơ quyết định về Xây front-end trước bằng MSW + localStorage cho module chưa có API backend.
│   ├── agents/
│   │   ├── code-conventions.md — Tài liệu về Code conventions dành cho AI agent.
│   │   ├── domain.md — Tài liệu về Domain Docs.
│   │   ├── issue-tracker.md — Tài liệu về Issue tracker: GitHub.
│   │   └── triage-labels.md — Tài liệu về Triage Labels.
│   ├── FRONTEND-GUIDE.md — Tài liệu về Frontend Guide.
│   ├── nike-ui-ux-analysis.md — Tài liệu về Nike — Phân tích UI/UX và Kiến trúc Front-end.
│   ├── plan/
│   │   ├── storefront-clean-code-plan.md — Tài liệu về Đánh giá kiến trúc và kế hoạch clean code Storefront.
│   │   ├── storefront-current-file-tree.md — Bản đồ file hiện tại và vai trò của từng file.
│   │   └── storefront-restructure-plan.md — Tài liệu về Kế hoạch tái cấu trúc Storefront.
│   ├── reference/
│   │   ├── ideal.md — Tài liệu tham khảo về Kiến trúc tổng thể.
│   │   ├── nike-ui-ux-analysis.md — Tài liệu tham khảo về 1. Kiến trúc tổng thể của Website.
│   │   ├── solution-architect-workflow-template.md — Tài liệu tham khảo về solution architect workflow template.
│   │   └── storefront-readme.md — Tài liệu tham khảo về E-commerce Next.js Frontend.
│   └── roadmap/
│       └── frontend-next-phase.md — Tài liệu về Kế hoạch thực thi Front-end — Giai đoạn tiếp theo.
├── .agents/
│   └── skills/
│       ├── animation-vocabulary/
│       │   └── SKILL.md — Hướng dẫn sử dụng skill animation-vocabulary.
│       ├── apple-design/
│       │   └── SKILL.md — Hướng dẫn sử dụng skill apple-design.
│       ├── emil-design-eng/
│       │   └── SKILL.md — Hướng dẫn sử dụng skill emil-design-eng.
│       ├── find-animation-opportunities/
│       │   └── SKILL.md — Hướng dẫn sử dụng skill find-animation-opportunities.
│       ├── hallmark/
│       │   ├── references/
│       │   │   ├── anti-patterns.md — Tham chiếu hallmark về Anti-patterns — the named tells.
│       │   │   ├── assets.md — Tham chiếu hallmark về Assets — sourcing canon for icons, logos, illustrations, photography, video.
│       │   │   ├── color.md — Tham chiếu hallmark về Colour.
│       │   │   ├── component-cookbook.md — Tham chiếu hallmark về Component cookbook.
│       │   │   ├── components/
│       │   │   │   ├── c1-outlined-chip.md — Tham chiếu hallmark về c1 outlined chip.
│       │   │   │   ├── c2-inline-form-as-cta.md — Tham chiếu hallmark về c2 inline form as cta.
│       │   │   │   ├── c3-typographic-link.md — Tham chiếu hallmark về c3 typographic link.
│       │   │   │   ├── c4-sticky-bottom-bar.md — Tham chiếu hallmark về c4 sticky bottom bar.
│       │   │   │   ├── f1-bento-grid.md — Tham chiếu hallmark về f1 bento grid.
│       │   │   │   ├── f2-sticky-scroll-stack.md — Tham chiếu hallmark về f2 sticky scroll stack.
│       │   │   │   ├── f3-tabular-spec-sheet.md — Tham chiếu hallmark về f3 tabular spec sheet.
│       │   │   │   ├── f4-step-sequence.md — Tham chiếu hallmark về f4 step sequence.
│       │   │   │   ├── f5-annotated-screenshot.md — Tham chiếu hallmark về f5 annotated screenshot.
│       │   │   │   ├── f6-product-card-grid.md — Tham chiếu hallmark về f6 product card grid.
│       │   │   │   ├── ft1-mast-headed.md — Tham chiếu hallmark về ft1 mast headed.
│       │   │   │   ├── ft2-inline-rule-single-line.md — Tham chiếu hallmark về ft2 inline rule single line.
│       │   │   │   ├── ft3-index-style-category-list.md — Tham chiếu hallmark về ft3 index style category list.
│       │   │   │   ├── ft4-dense-typographic.md — Tham chiếu hallmark về ft4 dense typographic.
│       │   │   │   ├── ft5-statement.md — Tham chiếu hallmark về ft5 statement.
│       │   │   │   ├── ft6-letter-close.md — Tham chiếu hallmark về ft6 letter close.
│       │   │   │   ├── ft7-newsletter-first.md — Tham chiếu hallmark về ft7 newsletter first.
│       │   │   │   ├── ft8-marquee-scroll.md — Tham chiếu hallmark về ft8 marquee scroll.
│       │   │   │   ├── h1-marquee.md — Tham chiếu hallmark về h1 marquee.
│       │   │   │   ├── h2-split-diptych.md — Tham chiếu hallmark về h2 split diptych.
│       │   │   │   ├── h3-quote-led.md — Tham chiếu hallmark về h3 quote led.
│       │   │   │   ├── h4-stat-led.md — Tham chiếu hallmark về h4 stat led.
│       │   │   │   ├── h5-letter-hero.md — Tham chiếu hallmark về h5 letter hero.
│       │   │   │   ├── h6-photographic-fold.md — Tham chiếu hallmark về h6 photographic fold.
│       │   │   │   ├── h7-demo-video-clipped-by-viewport-edge.md — Tham chiếu hallmark về h7 demo video clipped by viewport edge.
│       │   │   │   ├── h8-mockup-split-browser-framed.md — Tham chiếu hallmark về h8 mockup split browser framed.
│       │   │   │   ├── h9-custom-illustration-centerpiece.md — Tham chiếu hallmark về h9 custom illustration centerpiece.
│       │   │   │   ├── n1-wordmark-2-links.md — Tham chiếu hallmark về n1 wordmark 2 links.
│       │   │   │   ├── n10-floating-on-scroll-morph.md — Tham chiếu hallmark về n10 floating on scroll morph.
│       │   │   │   ├── n11-mega-menu.md — Tham chiếu hallmark về n11 mega menu.
│       │   │   │   ├── n12-banner-retract.md — Tham chiếu hallmark về n12 banner retract.
│       │   │   │   ├── n13-inline-cmdk-pill.md — Tham chiếu hallmark về n13 inline cmdk pill.
│       │   │   │   ├── n1b-saas-three-section.md — Tham chiếu hallmark về n1b saas three section.
│       │   │   │   ├── n2-floating-chip.md — Tham chiếu hallmark về n2 floating chip.
│       │   │   │   ├── n3-side-rail.md — Tham chiếu hallmark về n3 side rail.
│       │   │   │   ├── n4-hidden-behind-k.md — Tham chiếu hallmark về n4 hidden behind k.
│       │   │   │   ├── n5-floating-pill.md — Tham chiếu hallmark về n5 floating pill.
│       │   │   │   ├── n6-newspaper-masthead.md — Tham chiếu hallmark về n6 newspaper masthead.
│       │   │   │   ├── n7-brutal-slab.md — Tham chiếu hallmark về n7 brutal slab.
│       │   │   │   ├── n8-terminal-command.md — Tham chiếu hallmark về n8 terminal command.
│       │   │   │   ├── n9-edge-aligned-minimal.md — Tham chiếu hallmark về n9 edge aligned minimal.
│       │   │   │   ├── s1-left-margin-numbered.md — Tham chiếu hallmark về s1 left margin numbered.
│       │   │   │   ├── s2-hanging.md — Tham chiếu hallmark về s2 hanging.
│       │   │   │   ├── s3-sticky-pinned.md — Tham chiếu hallmark về s3 sticky pinned.
│       │   │   │   ├── s4-inline-no-break.md — Tham chiếu hallmark về s4 inline no break.
│       │   │   │   ├── s5-bottom-anchored.md — Tham chiếu hallmark về s5 bottom anchored.
│       │   │   │   ├── t1-pull-quote-with-marginalia.md — Tham chiếu hallmark về t1 pull quote with marginalia.
│       │   │   │   ├── t2-logo-wall-hairline.md — Tham chiếu hallmark về t2 logo wall hairline.
│       │   │   │   ├── t3-single-huge-quote.md — Tham chiếu hallmark về t3 single huge quote.
│       │   │   │   └── t4-numbered-stat-strip.md — Tham chiếu hallmark về t4 numbered stat strip.
│       │   │   ├── contract.md — Tham chiếu hallmark về Output contract & scope.
│       │   │   ├── copy.md — Tham chiếu hallmark về Copy.
│       │   │   ├── custom-craft.md — Tham chiếu hallmark về Custom craft — how to hand-build hero artwork.
│       │   │   ├── custom-theme.md — Tham chiếu hallmark về Custom theme — protocol.
│       │   │   ├── design-md.md — Tham chiếu hallmark về design.md — opt-in portable design system.
│       │   │   ├── export-formats.md — Tham chiếu hallmark về Export formats.
│       │   │   ├── floating-nav.md — Tham chiếu hallmark về Floating nav on scroll — the cross-fade morph.
│       │   │   ├── genres/
│       │   │   │   ├── atmospheric.md — Tham chiếu hallmark về Genre — atmospheric.
│       │   │   │   ├── editorial.md — Tham chiếu hallmark về Genre — editorial (default).
│       │   │   │   ├── modern-minimal.md — Tham chiếu hallmark về Genre — modern-minimal.
│       │   │   │   └── playful.md — Tham chiếu hallmark về Genre — playful.
│       │   │   ├── hero-enrichment.md — Tham chiếu hallmark về Hero enrichment — when, what, and how much.
│       │   │   ├── imagery-kit.md — Tham chiếu hallmark về Imagery kit — curated abstract assets, hosted, ready.
│       │   │   ├── interaction-and-states.md — Tham chiếu hallmark về Interaction and states.
│       │   │   ├── layout-and-space.md — Tham chiếu hallmark về Layout and space.
│       │   │   ├── macrostructures.md — Tham chiếu hallmark về Macrostructures.
│       │   │   ├── macrostructures/
│       │   │   │   ├── 01-bento-grid.md — Tham chiếu hallmark về 01 · Bento Grid.
│       │   │   │   ├── 02-long-document.md — Tham chiếu hallmark về 02 · Long Document.
│       │   │   │   ├── 03-marquee-hero.md — Tham chiếu hallmark về 03 · Marquee Hero.
│       │   │   │   ├── 04-stat-led.md — Tham chiếu hallmark về 04 · Stat-Led.
│       │   │   │   ├── 05-workbench.md — Tham chiếu hallmark về 05 · Workbench.
│       │   │   │   ├── 06-conversational-faq.md — Tham chiếu hallmark về 06 · Conversational FAQ.
│       │   │   │   ├── 07-manifesto.md — Tham chiếu hallmark về 07 · Manifesto.
│       │   │   │   ├── 08-photographic.md — Tham chiếu hallmark về 08 · Photographic.
│       │   │   │   ├── 09-quote-led.md — Tham chiếu hallmark về 09 · Quote-Led.
│       │   │   │   ├── 10-specimen.md — Tham chiếu hallmark về 10 · Specimen _(no longer the default)_.
│       │   │   │   ├── 11-catalogue.md — Tham chiếu hallmark về 11 · Catalogue.
│       │   │   │   ├── 12-letter.md — Tham chiếu hallmark về 12 · Letter.
│       │   │   │   ├── 13-index-first.md — Tham chiếu hallmark về 13 · Index-First.
│       │   │   │   ├── 14-narrative-workflow.md — Tham chiếu hallmark về 14 · Narrative Workflow.
│       │   │   │   ├── 15-split-studio.md — Tham chiếu hallmark về 15 · Split Studio.
│       │   │   │   ├── 16-feature-stack.md — Tham chiếu hallmark về 16 · Feature Stack.
│       │   │   │   ├── 17-type-specimen.md — Tham chiếu hallmark về 17 · Type Specimen.
│       │   │   │   ├── 18-portfolio-grid.md — Tham chiếu hallmark về 18 · Portfolio Grid.
│       │   │   │   ├── 19-map-diagram.md — Tham chiếu hallmark về 19 · Map / Diagram.
│       │   │   │   ├── 20-ecosystem-index.md — Tham chiếu hallmark về 20 · Ecosystem Index.
│       │   │   │   └── 21-component-playground.md — Tham chiếu hallmark về 21 · Component Playground.
│       │   │   ├── microinteractions.md — Tham chiếu hallmark về Microinteractions.
│       │   │   ├── motion.md — Tham chiếu hallmark về Motion.
│       │   │   ├── preview-examples.md — Tham chiếu hallmark về Preview-block worked examples.
│       │   │   ├── responsive.md — Tham chiếu hallmark về Responsive.
│       │   │   ├── slop-test.md — Tham chiếu hallmark về Slop test — 58 gates + pre-emit self-critique.
│       │   │   ├── structure.md — Tham chiếu hallmark về Structure.
│       │   │   ├── study.md — Tham chiếu hallmark về Study — extracting design DNA from a screenshot or URL.
│       │   │   ├── themes/
│       │   │   │   ├── carnival.md — Tham chiếu hallmark về Theme — Carnival.
│       │   │   │   ├── cobalt.md — Tham chiếu hallmark về Theme — Cobalt.
│       │   │   │   ├── hum.md — Tham chiếu hallmark về Theme — Hum.
│       │   │   │   └── lumen.md — Tham chiếu hallmark về Theme — Lumen.
│       │   │   ├── typography.md — Tham chiếu hallmark về Typography.
│       │   │   └── verbs/
│       │   │       ├── audit.md — Tham chiếu hallmark về hallmark audit.
│       │   │       └── redesign.md — Tham chiếu hallmark về hallmark redesign.
│       │   └── SKILL.md — Hướng dẫn sử dụng skill hallmark.
│       ├── improve-animations/
│       │   ├── AUDIT.md — Tham chiếu improve-animations về Animation Audit Playbook.
│       │   ├── PLAN-TEMPLATE.md — Tham chiếu improve-animations về Plan Template.
│       │   └── SKILL.md — Hướng dẫn sử dụng skill improve-animations.
│       ├── pick-ui-library/
│       │   └── SKILL.md — Hướng dẫn sử dụng skill pick-ui-library.
│       ├── prototype/
│       │   ├── PICKER.md — Tham chiếu prototype về The Picker.
│       │   └── SKILL.md — Hướng dẫn sử dụng skill prototype.
│       └── review-animations/
│           ├── SKILL.md — Hướng dẫn sử dụng skill review-animations.
│           └── STANDARDS.md — Tham chiếu review-animations về Animation Standards Reference.
├── .claude/
│   ├── commands/
│   │   ├── implement-issue.md — Quy trình agent chạy lệnh implement issue.
│   │   ├── review-change.md — Quy trình agent chạy lệnh review change.
│   │   └── verify.md — Quy trình agent chạy lệnh verify.
│   ├── hooks/
│   │   └── format-edited.mjs — Hook định dạng file được agent sửa.
│   ├── rules/
│   │   ├── apps/
│   │   │   ├── admin-cms.md — Quy ước cho Admin and CMS conventions.
│   │   │   ├── frontend-architecture.md — Quy ước cho Frontend architecture.
│   │   │   ├── project-structure.md — Quy ước cho Project structure conventions.
│   │   │   └── storefront.md — Quy ước cho Storefront conventions.
│   │   ├── core/
│   │   │   ├── imports-and-reuse.md — Quy ước cho Import aliases and code reuse.
│   │   │   ├── solid-patterns.md — Quy ước cho Clean Code and SOLID in React/TypeScript.
│   │   │   ├── typescript-react.md — Quy ước cho TypeScript and React conventions.
│   │   │   └── typescript-strict-style.md — Quy ước cho TypeScript strict conventions.
│   │   ├── data/
│   │   │   ├── api-data.md — Quy ước cho Contract, API and data conventions.
│   │   │   ├── error-handling.md — Quy ước cho Error handling conventions.
│   │   │   └── localization.md — Quy ước cho Localization conventions.
│   │   ├── process/
│   │   │   ├── git-workflow.md — Quy ước cho Git and Pull Request conventions.
│   │   │   └── testing.md — Quy ước cho Testing conventions.
│   │   ├── react/
│   │   │   ├── loading-and-toast.md — Quy ước cho Loading state and toast message conventions.
│   │   │   ├── render-performance.md — Quy ước cho React re-render control conventions.
│   │   │   └── ui-accessibility.md — Quy ước cho UI, styling and accessibility conventions.
│   │   └── README.md — Quy ước cho Rules index.
│   └── settings.json — Thiết lập Claude Code cấp repository.
└── agent/
    └── skills/
        ├── animation-vocabulary/
        │   └── SKILL.md — Hướng dẫn sử dụng skill animation-vocabulary.
        ├── apple-design/
        │   └── SKILL.md — Hướng dẫn sử dụng skill apple-design.
        ├── emil-design-eng/
        │   └── SKILL.md — Hướng dẫn sử dụng skill emil-design-eng.
        ├── find-animation-opportunities/
        │   └── SKILL.md — Hướng dẫn sử dụng skill find-animation-opportunities.
        ├── improve-animations/
        │   ├── AUDIT.md — Tham chiếu improve-animations về Animation Audit Playbook.
        │   ├── PLAN-TEMPLATE.md — Tham chiếu improve-animations về Plan Template.
        │   └── SKILL.md — Hướng dẫn sử dụng skill improve-animations.
        ├── pick-ui-library/
        │   └── SKILL.md — Hướng dẫn sử dụng skill pick-ui-library.
        ├── prototype/
        │   ├── PICKER.md — Tham chiếu prototype về The Picker.
        │   └── SKILL.md — Hướng dẫn sử dụng skill prototype.
        └── review-animations/
            ├── SKILL.md — Hướng dẫn sử dụng skill review-animations.
            └── STANDARDS.md — Tham chiếu review-animations về Animation Standards Reference.
```

## Cấu hình, CI và tooling

```text
fe-ecommerce-nike-style/
├── .env.example — Mẫu biến môi trường cho storefront, API origin, MSW và tích hợp tùy chọn.
├── .gitattributes — Quy tắc Git xử lý file, gồm chuẩn hóa line ending khi áp dụng.
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md — Tài liệu về Summary.
│   └── workflows/
│       ├── ci.yml — CI chạy lint, format, typecheck, test và kiểm tra type OpenAPI.
│       └── pr-title-lint.yml — Kiểm tra tiêu đề PR theo quy ước commit.
├── .gitignore — Loại trừ file local, dependency và output build khỏi Git.
├── .husky/
│   ├── commit-msg — Hook kiểm tra commit message.
│   ├── pre-commit — Hook chạy lint-staged, lint, typecheck và build trước commit.
│   └── pre-push — Hook chạy typecheck và build trước khi push.
├── .markdownlint.json — Quy tắc lint Markdown.
├── .npmrc — Cấu hình pnpm/npm cấp repository.
├── .prettierignore — Danh sách đường dẫn Prettier bỏ qua.
├── .prettierrc.mjs — Cấu hình định dạng Prettier và plugin.
├── AGENTS.md — Tài liệu về Hướng dẫn dành cho agent.
├── CLAUDE.md — Tài liệu về Agent skills.
├── commitlint.config.mjs — Quy tắc Conventional Commits và kiểm tra nội dung commit.
├── CONTRIBUTING.md — Tài liệu về Contributing.
├── design.md — Tài liệu về Design — fe-ecommerce-nike-style.
├── eslint.base.mjs — Quy tắc ESLint nền tảng cho JavaScript, TypeScript, React và Next.
├── eslint.config.mjs — Cấu hình ESLint root, gồm import, kiến trúc, test và ngoại lệ.
├── lint-staged.config.mjs — Các lệnh kiểm tra/định dạng file đã stage.
├── next.config.ts — Cấu hình Next, rewrite /api/v1, ảnh từ xa, next-intl và Serwist.
├── package.json — Manifest dependency, phiên bản pnpm và script chạy app, build, test, lint, sinh OpenAPI.
├── playwright.config.ts — Cấu hình browser E2E và web server thử nghiệm.
├── pnpm-lock.yaml — Khóa cây dependency để frozen install tái lập được.
├── pnpm-workspace.yaml — Chính sách allowBuilds và overrides của pnpm cho app root.
├── postcss.config.mjs — Cấu hình PostCSS tích hợp Tailwind.
├── README.md — Tài liệu về FE E-commerce Nike Style.
├── scripts/
│   └── gen-api.mjs — Đọc OpenAPI từ tag đã pin hoặc OPENAPI_URL, sinh type TypeScript.
├── skills-lock.json — Thông tin phiên bản/nguồn của các skill cài cho workspace.
├── tailwind.config.ts — Cấu hình Tailwind của storefront.
├── tsconfig.json — Cấu hình TypeScript, alias @/ và phạm vi typecheck.
└── vitest.config.ts — Cấu hình Vitest và môi trường kiểm thử.
```
