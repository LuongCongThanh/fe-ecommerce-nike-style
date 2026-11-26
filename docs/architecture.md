# Kiến trúc hiện tại

Thiết kế chuyển đổi đã duyệt, chưa triển khai: [ADR 0001](adr/0001-domain-modules-and-readable-names.md) và [cây đích/lộ trình](plan/storefront-structure-migration.md). Các đường dẫn dưới đây tiếp tục mô tả source hiện hành.

Owner: maintainer storefront. Đối chiếu checkout 18/11/2026, boundary enforcement 26/11/2026; source và executable config là bằng chứng hiện trạng. [Rule map](agents/code-conventions.md) dẫn tới quy tắc chi tiết.

## Module và chiều phụ thuộc

```text
src/app              route/layout, metadata, composition
src/providers        AppProviders (root mount), query-client factory
src/layouts          Header, Footer, MobileNav, DesktopMegaMenu, useMergeGuestDataOnLogin,
                     RouteErrorState, NotFoundState, OfflineState (UI của error/not-found/~offline),
                     catalog/CatalogWishlistAction (wishlist slot cho ProductCard)
src/modules         catalog (task 38; nguyên owner, gồm mock-content),
                     home (task 43; gồm useCanRender3D và types),
                     auth, account (task 40), cart, wishlist (task 41),
                     checkout, orders (task 42)
src/shared           components (UI primitives), routing, styles, feedback, queries,
                     persistence, pagination, formatting, monitoring, utils,
                     hooks, lib (query client, env, seo, cloudinary), common types
src/integrations/backend  HTTP client, endpoints/mappers, generated types, MSW, schemas (task 39)
src/i18n             locale routing/request/navigation
src/styles           theme, semantic preset, login, global CSS
src/testing          Vitest setup và render helper
src/pwa              service worker
```

Chiều phụ thuộc là app → feature → shared components/utility → API/schema. Không cần mỗi feature có đủ thư mục api/components/hooks/schemas; tạo khi có trách nhiệm thật. Catalog (task 38), home (task 43), auth và account (task 40), cart và wishlist (task 41), checkout và orders (task 42) đã sang `src/modules`; `src/features` đã bị xóa và không còn rule nào chấp nhận path cũ (task 44). Search thuộc catalog; header/footer/navigation nằm ở `src/layouts` (task 37), khác cây đích tám feature của kế hoạch lịch sử.

Route giữ composition. Component trình bày nhận view model; endpoint/query hook/controller sở hữu network, mapper và invalidation. Catalog mapper hiện nằm tại `src/integrations/backend/endpoints/catalog.ts`, không khẳng định mọi mapper đã chuyển vào feature. API client không import module auth: adapter runtime tạo seam ngược có chủ ý.

Một số flow cần phối hợp feature: shell đọc session/cart/wishlist; wishlist chuyển item sang cart; checkout sử dụng cart và mở order; account hiển thị order. Không tạo barrel mới để che private import.

### Cấu trúc `src/shared` sau task 36

Cây `src/shared` sau task 36:

- `components/`: UI primitive thuần (trước đây `shared/ui`), không nghiệp vụ.
- `routing/`: `routes.ts`, `auth-cookies.ts` (hằng số điều hướng và middleware, giá trị giữ nguyên).
- `styles/`: `cn.ts`, `motion.ts`, `focusRing.ts`. `formatting/currency.ts`: `formatCurrency`.
- `feedback/notification.ts`: một owner toast. `queries/useApiMutation.ts`: cơ chế mutation client.
- `persistence/createPersistedListStore.ts`, `pagination/pagination.ts`, `monitoring/sentry.ts`.
- Giữ tại chỗ (ngoại lệ có danh sách, chưa có consumer phải đổi): `utils/utils.ts` (formatDate, formatDateTime, slugify, buildQueryString, truncateText, validateVietnamesePhone; inactive exception có tên, task 44 đã chứng minh không còn consumer ngoài `utils.test.ts`; giữ nguyên, không xóa vì file nằm trong coverage scope, không cấp API mới), `hooks/`, `lib/` (env, seo, cloudinary, errors/error-codes), `constants/` (app-config, query-keys). Các file này chờ slice owner của chúng (home, catalog, integrations).

### Boundary được enforce trong giai đoạn chuyển cấu trúc

Shared (task 36), providers và layouts (task 37), catalog (task 38), integrations/backend (task 39), home (task 43), auth và account (task 40), cart và wishlist (task 41), checkout và orders (task 42) đã chuyển sang cây đích; rule chỉ còn path đích (`modules/<module>`, `layouts`, `providers`, `integrations/backend`); task 44 đã bỏ root cũ `features/<module>`, `features/storefront-shell`, `app/_composition` khỏi `eslint.boundaries.mjs` và `scripts/check-module-boundaries.ts`. `pnpm lint` chạy hai lớp:

- `eslint.boundaries.mjs` (ESLint `import/no-restricted-paths`, `boundaries/elements`): shared/integrations không import module, app, layouts hay providers; module không import app, layouts hay providers.
- `scripts/check-module-boundaries.ts` (`pnpm lint:boundaries`): import liên module chỉ qua consumer + file + named symbol trong ma trận [public boundary](plan/tasks/18-storefront-module-boundaries/boundaries.md); chặn namespace, side-effect, dynamic import, `vi.mock` string, re-export, cycle cấp module và path nội bộ không resolve; kiểm manifest coverage với `vitest.config.ts` (mọi file coverage phải có trong manifest và còn tồn tại).

Vi phạm đang tồn tại được snapshot từng cạnh chính xác, có lý do và đợt xóa; snapshot hết consumer làm check fail (stale), nên đợt sở hữu phải xóa nó cùng lượt. Hiện không còn cạnh ngoại lệ nào (`checkout/queries/useCreateOrder` → cart store đã bỏ ở task 42: checkout lấy `clearCart` từ `useCart()`).

Test cùng owner được dùng private implementation của owner; test khác module theo cùng allowlist như production. Test của module khác cần seed/đọc cart dùng test entry của owner `modules/cart/testing/cart.fixture` (`resetCartForTest`, `readCartItemsForTest`), được allowlist chỉ cho file test (`testOnly`) của wishlist và checkout. Không thêm wildcard hay exemption cho cả modules hay tests.

## Data và state

| State               | Owner                                             | Quy tắc                                                                                 |
| ------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Server data         | TanStack Query trong feature queries/hooks        | Key/catalogKeys, orderKeys, addressKeys cùng owner; mutation invalidate owner liên quan |
| Shared client state | Zustand: auth, cart, wishlist và UI store hiện có | Không sao chép toàn bộ server cache; persistence mock không phải contract thật          |
| Form                | React Hook Form + validation                      | Field errors tại form, feedback một owner                                               |
| Filter/sort/page    | URL                                               | Giữ link chia sẻ và back/forward; reset page khi đổi bộ lọc theo flow                   |
| Local interaction   | State trong component                             | Đặt ở phạm vi nhỏ nhất; không global hóa mặc định                                       |

Query client tạo một lần mỗi instance Providers bằng lazy state trong `src/providers/AppProviders.tsx`; root layout mount Providers duy nhất. Locale layout chỉ mount NextIntlClientProvider. Không mount query/session/theme provider lại trong từng nhóm route. `src/providers/query-client.ts` giữ chính sách cache/retry hiện tại.

## Session và HTTP boundary

AuthRuntimeProvider đăng ký `getAccessToken`, refresh và failure callback với `src/integrations/backend/client/runtime.ts` trước bootstrap; cleanup unregister adapter. HTTP client đọc adapter thay vì import feature, gắn token và xử lý refresh/retry theo implementation trong `src/integrations/backend/client/fetcher.ts`.

Auth store sở hữu access/refresh token trong memory. Mock bootstrap không khôi phục session sau F5 khi memory trống; đó là giới hạn hiện hành, không phải cookie auth đã hoạt động. Không lưu token vào localStorage để che giới hạn. AuthGuard là UX, backend vẫn phải enforce authorization. Cookie/Guest cart/merge thật thuộc cutover [roadmap](roadmap.md).

## Locale, metadata và PWA

`src/i18n` cấu hình `vi`/`en`; locale layout kiểm locale, gọi setRequestLocale và cấp messages. Root layout ngoài `[locale]` gọi getLocale cho `html lang`; root metadata có metadataBase từ NEXT_PUBLIC_SITE_URL và mặc định ANTIGRAVITY.STORE/vi_VN. Metadata route cụ thể cần kiểm riêng, không suy ra mọi trang đã có SEO localized hoàn chỉnh.

`/~offline` ngoài locale, fallback về tiếng Việt và link `/vi`; đây là khoảng trống localization đã biết. Serwist dùng `src/pwa/sw.ts`, build ra `public/sw.js`, đăng ký ở production và tắt trong development. Worker dùng defaultCache, document fallback `~offline`, skipWaiting/clientsClaim/navigationPreload; không hứa offline checkout.

MSW server khởi động qua instrumentation Node; browser khởi động qua shared API-mocking helper khi flag bật. Playwright dùng HTTP catalog harness riêng bám generated OpenAPI để cả browser proxy lẫn request server-side có thể kiểm thử mà không cần Backend. `playwright.production.config.ts` chạy production build/server trên port riêng, `NEXT_PUBLIC_API_MOCKING=false`, và kiểm runtime/catalog/provider cùng service-worker fallback; SSR assertion production chưa có (quyết định người dùng 26/11/2026: không thêm Playwright mới); SSR được kiểm bằng unit/HTTP-level test. Serwist và MSW là hai service-worker responsibility khác nhau: tránh suy luận hành vi production từ dev MSW; kiểm cache, registration và network trong browser khi đổi chúng. Xem [API boundary](api-integration.md).

## SSR public catalog

Hiện `/[locale]/products`, `/[locale]/products/[slug]` và phần catalog của `/[locale]/home` (danh mục nổi bật, hàng mới về) render dữ liệu phía server; các trang catalog khác vẫn client-side, trừ khi một mục dưới đây ghi khác. Page đọc `searchParams`, gọi `prefetchProductsListing` (`modules/catalog/server/prefetchCatalog.ts`) rồi bọc UI bằng `HydrationBoundary` dưới QueryClient browser ở root. Prefetch dùng QueryClient mới cho mỗi request (không retry, không giữ giữa các request), cùng `catalogKeys` và chính sách query (`modules/catalog/queries/catalogQuery.ts`: PAGE_SIZE 12, categories/sizes/colors stale 10 phút, categories dạng `{tree, flat}`) với hook, và chỉ dehydrate query thành công; timeout/5xx bỏ query đó để hook browser tự đọc lại. Slug category không có trong cây thì không gọi products. PDP gọi `prefetchProductDetail(slug)`: đọc product theo slug (404 lưu `null`, UI not-found hiện tại giữ nguyên), rồi related products (`buildRelatedQuery(categoryId)`, cùng key `catalogKeys.products` với `useRelatedProducts`); lỗi related không làm mất product, lỗi product bỏ key để hook browser tự đọc lại. Chọn variant (màu/size/ảnh/giá) vẫn hoàn toàn ở client (`useVariantSelection`); SSR không đổi mua hàng, stock hay mapper. Reader và config: [API boundary](api-integration.md#public-server-reader-ssr). Home gọi `prefetchHome` (cây danh mục + 5 sản phẩm mới nhất, key `HOME_NEW_ARRIVALS_QUERY` dùng chung với `SectionNewArrivals`), bọc `HydrationBoundary`; hero, editorial, newsletter và fixture vẫn client/tĩnh, không đổi personalization. Không ISR/persistent cache; không tuyên bố toàn catalog SSR.

## 3D trong storefront

| Surface   | Owner                                                               | Gate hiện tại                                                   |
| --------- | ------------------------------------------------------------------- | --------------------------------------------------------------- |
| Home Hero | `src/modules/home/components/hero3d/HeroSlides3D.tsx`               | HeroCarousel dynamic import `ssr: false`, useCanRender3D        |
| PDP       | `src/modules/catalog/product-detail/components/ProductViewer3D.tsx` | ProductInfoPanel dynamic import `ssr: false`, chỉ khi PDP mount |

Không import `three`/`@react-three/*` từ route/layout dùng chung: WebGL không có server renderer, chunk nặng không thuộc đường găng mọi trang. Hero lên lịch kiểm tra idle/timer, dùng capability hook `off`/`pending`/`ready` và tier; thất bại giữ 2D cho phiên. Không mô tả PDP đã dùng cùng capability gate khi source chỉ có dynamic import. Surface mới cần quyết định rõ và gate/fallback tương ứng.

`@react-three/drei` chỉ ở PDP; Hero dùng core three + fiber. Không đưa Environment tải HDR từ CDN pmndrs vào surface mới. Dùng readTokenColor cho token/dark mode. Scene phải pause rAF khi tab ẩn/ngoài viewport, fallback 2D vĩnh viễn khi context lost và dispose texture/material khi unmount; kiểm chứng từng surface khi sửa thay vì coi policy là bằng chứng mọi scene đã tuân thủ.

WebGL chỉ sở hữu pixel. Link, focus, ARIA và autoplay ở DOM. Hero giữ carousel DOM, canvas vẽ đè; ảnh DOM đổi opacity trong cùng commit. Reduced motion/static poster và CTA bình thường phải tiếp tục hoạt động khi WebGL không sẵn sàng.

Hai lỗi kỹ thuật cần giữ: uniform phải tồn tại ngay khi ShaderMaterial khởi tạo, vì danh sách được chốt khi link program lần đầu; gán uniforms sau reconciler có thể gây sampler validate fail/canvas đen. Comment GLSL không chứa backtick trong template literal TypeScript; `active` là từ khóa GLSL dành riêng.

### Baseline LCP lịch sử

Ngày 2026-08-30: production build + next start, Chromium 390×844, CPU throttle 4×, khoảng 1.6 Mbps/150 ms RTT, trung vị ba lần:

| Mode                         | LCP     |
| ---------------------------- | ------- |
| Hero WebGL canvas mount      | 1524 ms |
| Hero gate tắt/reduced motion | 1516 ms |

Đây là baseline lịch sử, chưa đo lại trong đợt docs. Đo lại khi thay thời điểm mount; không dùng chênh lệch này làm chứng nhận hiệu năng hiện tại.

Khi sửa motion trang chủ, kiểm reduced motion, lần xuất hiện đầu, trạng thái gửi newsletter và nhịp giữa chữ, ảnh, CTA và carousel. Giữ easing/duration nhất quán, transform reveal đầy đủ và crossfade không làm mất focus hoặc feedback. Mốc rà animation trước đây là commit `30961c2`; Git giữ chi tiết sáu hạng mục lịch sử.

### Catalog và wishlist composition (task 38)

`modules/catalog` không import wishlist: `ProductCard` nhận `wishlistAction?: ReactNode` và `CatalogProductGrid` nhận `renderWishlistAction?(productId)`. Heart nằm ở `layouts/catalog/CatalogWishlistAction` (dùng `useIsWishlisted`); hiện chưa consumer nào nối vì mọi card trước đây đặt `showWishlist={false}`. Cạnh catalog ↔ wishlist còn lại là wishlist → catalog (`priceRange`, `variantResolution`), một chiều. Schema/type đổi tên theo ADR: `schemas/filter.schema.ts`, `types/badge.types.ts`.
