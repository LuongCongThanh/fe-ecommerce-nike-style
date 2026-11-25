# Public boundary Storefront — quyết định đã chốt

Ngày chốt: 24/11/2026. Người dùng đã đồng ý hai vòng thảo luận (composition/public API và owner/enforcement). Đây là quyết định lập kế hoạch, chưa là quyền triển khai source. Dựa trên [inventory](../17-storefront-migration-inventory/inventory.md); source chưa đổi.

## Dữ kiện đã đối chiếu source

- `catalog/components/ProductCard.tsx` import `useIsWishlisted` từ wishlist; hook vẫn chạy khi `showWishlist=false`.
- Chiều ngược: `wishlist/components/WishlistClient.tsx` dùng `getProductPriceRange`; `wishlist/hooks/useMoveToCart.ts` dùng `getVariantAxes`, `resolveSku` từ catalog. Đây là vòng ở cấp module, dù không kết luận có vòng import file.
- Checkout dùng public hook `useCart`, nhưng `useCreateOrder` còn import `clearCart` trực tiếp từ store. Hook `useCart` đã trả `clearCart`; không cần facade mới để bỏ private store import này.
- Checkout dùng `orderKeys.list()` để invalidate cache sau tạo đơn. Ownership của key hiện tại là orders.
- Login merge nằm ở shell: `useMergeGuestDataOnLogin` theo dõi auth rồi gọi `mergeCartOnLogin`/`mergeWishlistOnLogin`; auth không import cart/wishlist.
- PDP `AddToCartSection` hiện disabled và ghi Sắp mở bán; không tạo thêm dependency catalog → cart hoặc mở tính năng này trong migration.

## Ma trận public entry được phép

Ma trận chốt consumer, owner file và symbol theo hướng đã duyệt; đường dẫn là đích migration, chưa tồn tại trong source. Danh sách consumer cụ thể ở phụ lục bên dưới. Không tạo barrel hoặc mặc định cho phép toàn bộ export cùng file.

| Consumer | Entry đích | Trách nhiệm / giới hạn |
| --- | --- | --- |
| home | `modules/catalog/components/ProductCard.tsx`: ProductCard; `components/CategoryCard.tsx`: CategoryCard | UI catalog, không mở toàn bộ nội bộ catalog |
| home | `modules/catalog/queries/useCategoryTree.ts`: useCategoryTree; `queries/catalogKeys.ts`: catalogKeys | Category query và chia sẻ cache key đang có; endpoint vẫn qua integrations |
| layouts | `modules/catalog/search/hooks/useHeaderSearch.ts`: useHeaderSearch; `queries/useCategoryTree.ts`: useCategoryTree | Header search/navigation |
| layouts | `modules/auth/session/useAuth.ts`: useAuth | Quan sát session; không truy cập auth store trực tiếp |
| providers | `modules/auth/session/AuthRuntimeProvider.tsx`: AuthRuntimeProvider | Mount runtime bridge; vòng đời chi tiết thuộc ticket runtime |
| layouts | `modules/cart/components/CartDrawer.tsx`: CartDrawer; `hooks/useCart.ts`: useCart, mergeCartOnLogin | Drawer/count và merge; không đọc store |
| layouts | `modules/wishlist/hooks/useWishlist.ts`: useWishlist, mergeWishlistOnLogin | Count và merge; giữ query behavior hiện tại |
| wishlist | `modules/catalog/priceRange.ts`: getProductPriceRange; `variantResolution.ts`: getVariantAxes, resolveSku | Quy tắc sản phẩm/SKU thuần; giữ owner catalog |
| wishlist | `modules/cart/hooks/useCart.ts`: useCart | Add qua hành động có sẵn, không ghi store |
| checkout | `modules/cart/hooks/useCart.ts`: useCart; CartLine chỉ khi cần type hiện tại | Items/totals/clear qua public hook; không import stores |
| checkout | `modules/orders/queries/orderKeys.ts`: orderKeys | Cache contract, không gọi UI/private query orders |
| app entries | Entry/symbol liệt kê tại phụ lục route bên dưới | Route có thể dùng entry hiện có; không cho phép store hoặc export khác ngầm |

## Hai hướng đã được người dùng chốt ngày 24/11/2026

- Bỏ chiều catalog → wishlist bằng props/slot, phần nối ở app/layout composition; catalog tiếp tục sở hữu quy tắc giá và SKU. Giữ UI, accessibility và hành vi đang có.
- Checkout/wishlist giữ orchestration nhỏ; login merge thuộc layouts. Dùng public hook/action/cache key cụ thể đã có, không tạo facade hoặc interface cho mỗi endpoint.

## Owner helper/type đã chốt

Test cạnh source đi cùng owner/basename; không bỏ test vì source chưa thấy production consumer. Không chuyển logic sản phẩm vào shared để né cycle.

| Hiện tại dưới src/shared | Owner / đích | Giới hạn |
| --- | --- | --- |
| `lib/api-mocking.ts` | `integrations/backend/adapters/browser-bootstrap.ts` | Giữ promise memoization; browser entry, runtime ticket chốt bảo vệ |
| `lib/errors/api-error.ts` + test | Canonical `integrations/backend/client/api-error.ts`; test shim được đánh giá tại policy kiểm chứng | Dùng cùng một class; bridge chỉ tạm, không tạo class khác |
| `types/user.ts` | `integrations/backend/models/user.types.ts` | Alias contract hiện có, không tạo business entity hay nhân đôi shape |
| `lib/query-client.ts` | `providers/query-client.ts` | Factory và policy dùng ở app provider; không nhập module nghiệp vụ |
| `hooks/useCanRender3D.ts` + test | `modules/home/hooks/useCanRender3D.ts` | Consumer production hiện tại chỉ home |
| `lib/mock-content.ts` | `modules/catalog/mock-content.ts` | Consumer production hiện tại ProductDetailTabs; không đổi env flag |
| `constants/routes.ts` | `shared/routing/routes.ts` | Hợp đồng điều hướng app; không chuyển route map toàn app vào auth chỉ vì hai consumer hiện tại; giữ nguyên giá trị, kể cả legacy |
| `constants/auth-cookies.ts` | `shared/routing/auth-cookies.ts` | Hằng số middleware, không import auth store; không đổi cookie hay nghĩa authorization |
| `lib/motion.ts`, `lib/focusRing.ts` | `shared/styles/motion.ts`, `shared/styles/focusRing.ts` | Quy ước visual chung có owner rõ, không chứa nghiệp vụ |
| `lib/notification.ts` + test | `shared/feedback/notification.ts` | UI feedback, một owner toast |
| `lib/hooks/useApiMutation.ts` + test | `shared/queries/useApiMutation.ts` | Cơ chế mutation client dùng bởi nhiều module; không nhập domain module |
| `lib/hooks/createPersistedListStore.ts` + test | `shared/persistence/createPersistedListStore.ts` | Cơ chế lưu client, không hiểu Product/Order |
| `utils/pagination.ts` + test | `shared/pagination/pagination.ts` | Cơ chế pagination cho UI |
| `utils/utils.ts` + test | `shared/styles/cn.ts`, `shared/formatting/currency.ts`; export khác giữ bridge tạm đến khi xác minh consumer/tooling | Tách theo trách nhiệm; không xóa export khác chỉ từ quét import |
| `lib/monitoring/sentry.ts` | `shared/monitoring/sentry.ts` | App error boundary dùng; không thêm domain behavior |
| `constants/app-config.ts`, `constants/query-keys.ts`, `lib/env.ts`, `lib/errors/error-codes.ts`, `hooks/useLocalStorage.ts`, `hooks/useMediaQuery.ts`, `hooks/usePagination.ts`, `lib/cloudinary.ts`, `lib/seo.ts` và test tương ứng | Giữ nguyên trong migration nếu chưa có consumer phải đổi; không công khai thêm | Chưa thấy production import qua inventory; đây là ngoại lệ giữ path có danh sách, không phải quyết định xóa. Rà dynamic/config/tooling trước cleanup; không ép relocate code không dùng để đủ cây |

Orders giữ `orderKeys`; không nhập hoặc hợp nhất `shared/constants/query-keys.ts` ngầm. Các type chỉ dùng nội bộ giữ cạnh owner. `useReservation` có thể nhận structural input chỉ gồm skuId/quantity thay vì buộc public CartLine đầy đủ; không đổi thứ tự/item key hoặc reservation semantics.

## Enforcement đã chốt

- Production cross-module chỉ cho phép consumer + file + named symbol trong ma trận đã chốt; cấm namespace/re-export hoặc default import không được liệt kê để né allowlist, private store và barrel mới. Chặn cycle cấp module (khác cycle file hiện có).
- Module không import `app`, `layouts`, `providers`; shared và integrations không import domain modules. Providers/layouts là composition consumers với entry được chỉ rõ. Runtime-specific client/server guards được chốt trong ticket runtime.
- Public entry chưa cần facade file mới: dùng file owner cụ thể và giới hạn symbol. Không công khai mọi export chỉ vì cùng file.
- Test cùng owner được chạm private implementation của chính owner; test consumer phải dùng public API module khác. Test liên module đặc biệt cần allowlist chính xác theo file, nêu lý do; không exempt toàn bộ tests khỏi boundary mới. Mock SDK/MSW test helper là entry riêng, không được production import.
- Giai đoạn chuyển cho phép đúng các edge/path cũ được snapshot và có delivery slice sở hữu việc xóa. Không wildcard cả features/modules, không tắt boundary toàn cục; consumer đổi cùng owner trong slice.
- Delivery config cần chứng minh import hợp lệ qua được, import private/wrong symbol và cycle bị chặn; dùng lint fixture/check phù hợp. Không đổi executable config trong ticket này. Slice kết thúc migration phải xóa bridge/ngoại lệ đã hết consumer; các file inactive giữ nguyên ở danh sách trên vẫn không được cấp public dependency mới.

## Contract composition cho wishlist action

- Catalog công khai ProductCard và các screen/component đã có consumer; card nhận optional action slot (ReactNode) thay vì import wishlist. Các grid/carousel/screen cần action theo từng product nhận render prop có input productId tối thiểu; không đưa wishlist store/type vào signature catalog.
- Phần nối client ở `layouts/catalog/` tạo action component dùng `modules/wishlist/hooks/useWishlist.ts`: `useIsWishlisted`. Đây là consumer được phép bổ sung cho symbol đó; action giữ heart icon, label dịch, aria-pressed, chuyển động, toggle và hành vi click không điều hướng link.
- Các route/catalog composition dùng render prop bên trong client boundary; không truyền function từ Server Component qua ranh giới RSC. Phần route chỉ nối entry mỏng, code UI/composition nằm ngoài app. File/layout wrapper cụ thể được ghi trong delivery spec, không tạo package hay lớp nghiệp vụ mới.
- Consumer hiện `showWishlist=false` không được tự bật heart; consumer đang có action phải được nối action tương đương. Giữ ID string hiện có, không map sang API ID mới hoặc mở mua hàng/PDP đang disabled.
- Đích module graph: home → catalog; wishlist → catalog/cart; checkout → cart/orders. Catalog không phụ thuộc wishlist/cart; auth không phụ thuộc cart/wishlist; account không phụ thuộc orders chỉ vì URL account/orders. App/layouts phối hợp screen theo URL hiện có.

## Public type và workflow seam

`useCart` và type CartLine là public tại file hook cho consumer hiện tại cần chúng; checkout bỏ import store clearCart và dùng action trả từ useCart. Nếu tách reservation input ở delivery, chỉ thu hẹp thành readonly skuId/quantity tại checkout, không thêm entity/type dùng chung hoặc đổi cache key. Interface được dùng khi workflow thuần cần dependency thay thế, có consumer và lý do kiểm thử/runtime cụ thể; hook orchestration nhỏ hiện tại được giữ. Không thêm repository/service chỉ chuyển tiếp endpoint.

## Ngoại lệ và trách nhiệm bàn giao

- Account/orders được compose bởi routes, chưa có quyền account → orders mới. Kiểu User là alias hợp đồng tích hợp, không thay đổi ý nghĩa domain đã có.
- Test cũ ProductCard/Wishlist đang import private wishlist/cart store không trở thành public API. Delivery chuyển chúng về test của owner hoặc tạo fixture có entry test riêng và allowlist chính xác; policy kiểm chứng quyết định cách thích ứng, không giảm behavior coverage.
- Snapshot cạnh cũ bên dưới chỉ là danh sách consumer để di chuyển, không phải permission vô hạn cho path cũ. Mỗi delivery spec xác định edge cũ nào tạm được giữ và slice xóa; cuối slice chuyển owner, consumer liên quan phải build/lint cùng nhau. Không cho cả hai source cùng semantics tồn tại thiếu owner.
- Tên file suffix schema/service/type theo ADR; nếu entry đổi basename trong slice, cập nhật allowlist cùng lượt. Không dùng rename để mở thêm symbol.
- Runtime protection, session/cache/SSR vẫn thuộc **Di chuyển provider và SDK thế nào để giữ đúng session, cache và server/client?**. Các giới hạn đó chưa được resolve bởi quyết định public boundary.

## Phụ lục consumer production cụ thể

Bảng lấy từ import literal hiện tại; cột nguồn là bằng chứng trước migration, cột đích là allowlist sau migration. Import type được ghi rõ và vẫn phải tuân boundary. Không áp dụng cho consumer không được liệt kê. Các entry composition mới mô tả ở trên chỉ được thêm đúng chức năng action slot.

| Consumer hiện tại | File đích được phép | Symbol / cách thay đổi |
| --- | --- | --- |
| `src/app/[locale]/(auth)/forgot-password/page.tsx` | `@/modules/auth/forgot-password/components/ForgotPasswordForm` | `{ ForgotPasswordForm }` |
| `src/app/[locale]/(auth)/login/page.tsx` | `@/modules/auth/login/components/LoginForm` | `{ LoginForm }` |
| `src/app/[locale]/(auth)/register/page.tsx` | `@/modules/auth/register/components/RegisterForm` | `{ RegisterForm }` |
| `src/app/[locale]/(auth)/reset-password/[token]/page.tsx` | `@/modules/auth/reset-password/components/ResetPasswordForm` | `{ ResetPasswordForm }` |
| `src/app/[locale]/(auth)/reset-password/[token]/page.tsx` | `@/modules/auth/schemas/auth.schema` | `{ isValidResetPasswordRequest }` |
| `src/app/[locale]/(shop)/account/addresses/page.tsx` | `@/modules/account/addresses/components/AddressesClient` | `{ AddressesClient }` |
| `src/app/[locale]/(shop)/account/layout.tsx` | `@/modules/auth/session/AuthGuard` | `{ AuthGuard }` |
| `src/app/[locale]/(shop)/account/orders/[id]/page.tsx` | `@/modules/orders/order-detail/components/OrderDetailClient` | `{ OrderDetailClient }` |
| `src/app/[locale]/(shop)/account/orders/page.tsx` | `@/modules/orders/order-list/components/OrdersClient` | `{ OrdersClient }` |
| `src/app/[locale]/(shop)/account/profile/page.tsx` | `@/modules/account/profile/components/ProfileClient` | `{ ProfileClient }` |
| `src/app/[locale]/(shop)/cart/page.tsx` | `@/modules/cart/components/CartClient` | `{ CartClient }` |
| `src/app/[locale]/(shop)/categories/[slug]/page.tsx` | `@/modules/catalog/category-detail/components/CategoryPageClient` | `{ CategoryPageClient }` |
| `src/app/[locale]/(shop)/checkout/layout.tsx` | `@/modules/auth/session/AuthGuard` | `{ AuthGuard }` |
| `src/app/[locale]/(shop)/checkout/page.tsx` | `@/modules/checkout/components/CheckoutClient` | `{ CheckoutClient }` |
| `src/app/[locale]/(shop)/checkout/page.tsx` | `@/modules/checkout/components/OrderSummary` | `{ OrderSummary }` |
| `src/app/[locale]/(shop)/checkout/page.tsx` | `@/modules/checkout/hooks/useCheckoutForm` | `{ useCheckoutForm }` |
| `src/app/[locale]/(shop)/checkout/success/page.tsx` | `@/modules/orders/services/order.service` | `{ getOrderOrNull }` |
| `src/app/[locale]/(shop)/home/page.tsx` | `@/modules/home/components/SectionEditorialCollection` | `{ SectionEditorialCollection }` |
| `src/app/[locale]/(shop)/home/page.tsx` | `@/modules/home/components/SectionFeaturedCategories` | `{ SectionFeaturedCategories }` |
| `src/app/[locale]/(shop)/home/page.tsx` | `@/modules/home/components/SectionHero` | `{ SectionHero }` |
| `src/app/[locale]/(shop)/home/page.tsx` | `@/modules/home/components/SectionNewArrivals` | `{ SectionNewArrivals }` |
| `src/app/[locale]/(shop)/home/page.tsx` | `@/modules/home/components/SectionNewsletter` | `{ SectionNewsletter }` |
| `src/app/[locale]/(shop)/home/page.tsx` | `@/modules/home/components/SectionWhyChooseUs` | `{ SectionWhyChooseUs }` |
| `src/app/[locale]/(shop)/layout.tsx` | `@/layouts/components/Footer` | `{ Footer }` |
| `src/app/[locale]/(shop)/layout.tsx` | `@/layouts/components/Header` | `{ Header }` |
| `src/app/[locale]/(shop)/products/[slug]/page.tsx` | `@/modules/catalog/product-detail/components/ProductDetailPageClient` | `{ ProductDetailPageClient }` |
| `src/app/[locale]/(shop)/products/page.tsx` | `@/modules/catalog/components/FilterSidebar` | `{ FilterSidebar }` |
| `src/app/[locale]/(shop)/products/page.tsx` | `@/modules/catalog/product-list/components/ProductsClient` | `ProductsClient` |
| `src/app/[locale]/(shop)/search/page.tsx` | `@/modules/catalog/search/components/SearchClient` | `{ SearchClient }` |
| `src/app/[locale]/(shop)/wishlist/page.tsx` | `@/modules/wishlist/components/WishlistClient` | `{ WishlistClient }` |
| `src/app/_composition/AppProviders.tsx` | `@/modules/auth/session/AuthRuntimeProvider` | `{ AuthRuntimeProvider }` |
| `src/features/catalog/components/ProductCard.tsx` | Không cho catalog → wishlist | Bỏ `{ useIsWishlisted }`; chuyển nối qua slot ở layouts/catalog |
| `src/features/checkout/components/CheckoutClient.tsx` | `@/modules/cart/hooks/useCart` | `{ useCart }` |
| `src/features/checkout/components/OrderSummary.tsx` | `@/modules/cart/hooks/useCart` | `{ useCart }` |
| `src/features/checkout/hooks/useRedirectIfCartEmpty.ts` | `@/modules/cart/hooks/useCart` | `{ useCart }` |
| `src/features/checkout/queries/useCreateOrder.ts` | `@/modules/cart/hooks/useCart` | `{ useCart }` |
| `src/features/checkout/queries/useCreateOrder.ts` | `@/modules/cart/hooks/useCart` | `{ clearCart }` lấy từ kết quả useCart; cấm import store |
| `src/features/checkout/queries/useCreateOrder.ts` | `@/modules/orders/queries/orderKeys` | `{ orderKeys }` |
| `src/features/checkout/queries/useReservation.ts` | `@/modules/cart/hooks/useCart` | `type { CartLine }` |
| `src/features/home/components/SectionFeaturedCategories.tsx` | `@/modules/catalog/components/CategoryCard` | `{ CategoryCard }` |
| `src/features/home/components/SectionFeaturedCategories.tsx` | `@/modules/catalog/queries/useCategoryTree` | `{ useCategoryTree }` |
| `src/features/home/components/SectionNewArrivals.tsx` | `@/modules/catalog/components/ProductCard` | `{ ProductCard }` |
| `src/features/home/components/SectionNewArrivals.tsx` | `@/modules/catalog/queries/catalogKeys` | `{ catalogKeys }` |
| `src/features/storefront-shell/components/DesktopMegaMenu.tsx` | `@/modules/catalog/queries/useCategoryTree` | `{ useCategoryTree }` |
| `src/features/storefront-shell/components/Header.tsx` | `@/modules/auth/session/useAuth` | `{ useAuth }` |
| `src/features/storefront-shell/components/Header.tsx` | `@/modules/cart/components/CartDrawer` | `{ CartDrawer }` |
| `src/features/storefront-shell/components/Header.tsx` | `@/modules/cart/hooks/useCart` | `{ useCart }` |
| `src/features/storefront-shell/components/Header.tsx` | `@/modules/catalog/search/hooks/useHeaderSearch` | `{ useHeaderSearch }` |
| `src/features/storefront-shell/components/Header.tsx` | `@/layouts/components/DesktopMegaMenu` | `{ DesktopMegaMenu }` |
| `src/features/storefront-shell/components/Header.tsx` | `@/layouts/components/MobileNav` | `{ MobileNav }` |
| `src/features/storefront-shell/components/Header.tsx` | `@/layouts/hooks/useMergeGuestDataOnLogin` | `{ useMergeGuestDataOnLogin }` |
| `src/features/storefront-shell/components/Header.tsx` | `@/modules/wishlist/hooks/useWishlist` | `{ useWishlist }` |
| `src/features/storefront-shell/components/MobileNav.tsx` | `@/modules/catalog/queries/useCategoryTree` | `{ useCategoryTree }` |
| `src/features/storefront-shell/hooks/useMergeGuestDataOnLogin.ts` | `@/modules/auth/session/useAuth` | `{ useAuth }` |
| `src/features/storefront-shell/hooks/useMergeGuestDataOnLogin.ts` | `@/modules/cart/hooks/useCart` | `{ mergeCartOnLogin }` |
| `src/features/storefront-shell/hooks/useMergeGuestDataOnLogin.ts` | `@/modules/wishlist/hooks/useWishlist` | `{ mergeWishlistOnLogin }` |
| `src/features/wishlist/components/WishlistClient.tsx` | `@/modules/catalog/priceRange` | `{ getProductPriceRange }` |
| `src/features/wishlist/hooks/useMoveToCart.ts` | `@/modules/cart/hooks/useCart` | `{ useCart }` |
| `src/features/wishlist/hooks/useMoveToCart.ts` | `@/modules/catalog/variantResolution` | `{ getVariantAxes, resolveSku }` |
