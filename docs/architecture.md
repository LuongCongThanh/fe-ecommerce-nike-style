# Kiến trúc hiện tại

Owner: maintainer storefront. Đối chiếu checkout 18/11/2026; source và executable config là bằng chứng hiện trạng. [Rule map](agents/code-conventions.md) dẫn tới quy tắc chi tiết.

## Module và chiều phụ thuộc

```text
src/app              route/layout, metadata, composition
src/features         home, storefront-shell, catalog, auth, account,
                     cart, wishlist, checkout, orders
src/shared           UI, hooks, utilities, query client, common types
src/lib/api          HTTP client, endpoints/mappers, generated types, MSW
src/lib/schemas      validation hiện có
src/i18n             locale routing/request/navigation
src/styles           theme, semantic preset, login, global CSS
src/testing          Vitest setup và render helper
src/pwa              service worker
```

Chiều phụ thuộc là app → feature → shared UI/utility → API/schema. Không cần mỗi feature có đủ thư mục api/components/hooks/schemas; tạo khi có trách nhiệm thật. Search hiện thuộc catalog, home và storefront-shell là feature riêng, khác cây đích tám feature của kế hoạch lịch sử.

Route giữ composition. Component trình bày nhận view model; endpoint/query hook/controller sở hữu network, mapper và invalidation. Catalog mapper hiện nằm tại `src/lib/api/endpoints/catalog.ts`, không khẳng định mọi mapper đã chuyển vào feature. API client không import auth feature: adapter runtime tạo seam ngược có chủ ý.

Một số flow cần phối hợp feature: shell đọc session/cart/wishlist; wishlist chuyển item sang cart; checkout sử dụng cart và mở order; account hiển thị order. Giữ seam/public responsibility rõ và đối chiếu `eslint.config.mjs` trước khi đổi import. Không cấm mọi cross-feature import hoặc tạo barrel mới để che private import.

## Data và state

| State               | Owner                                             | Quy tắc                                                                                 |
| ------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Server data         | TanStack Query trong feature queries/hooks        | Key/catalogKeys, orderKeys, addressKeys cùng owner; mutation invalidate owner liên quan |
| Shared client state | Zustand: auth, cart, wishlist và UI store hiện có | Không sao chép toàn bộ server cache; persistence mock không phải contract thật          |
| Form                | React Hook Form + validation                      | Field errors tại form, feedback một owner                                               |
| Filter/sort/page    | URL                                               | Giữ link chia sẻ và back/forward; reset page khi đổi bộ lọc theo flow                   |
| Local interaction   | State trong component                             | Đặt ở phạm vi nhỏ nhất; không global hóa mặc định                                       |

Query client tạo một lần mỗi instance Providers bằng lazy state trong `src/app/_composition/AppProviders.tsx`; root layout mount Providers duy nhất. Locale layout chỉ mount NextIntlClientProvider. Không mount query/session/theme provider lại trong từng nhóm route. `src/shared/lib/query-client.ts` giữ chính sách cache/retry hiện tại.

## Session và HTTP boundary

AuthRuntimeProvider đăng ký `getAccessToken`, refresh và failure callback với `src/lib/api/client/runtime.ts` trước bootstrap; cleanup unregister adapter. HTTP client đọc adapter thay vì import feature, gắn token và xử lý refresh/retry theo implementation trong `src/lib/api/client/fetcher.ts`.

Auth store sở hữu access/refresh token trong memory. Mock bootstrap không khôi phục session sau F5 khi memory trống; đó là giới hạn hiện hành, không phải cookie auth đã hoạt động. Không lưu token vào localStorage để che giới hạn. AuthGuard là UX, backend vẫn phải enforce authorization. Cookie/Guest cart/merge thật thuộc cutover [roadmap](roadmap.md).

## Locale, metadata và PWA

`src/i18n` cấu hình `vi`/`en`; locale layout kiểm locale, gọi setRequestLocale và cấp messages. Root layout ngoài `[locale]` gọi getLocale cho `html lang`; root metadata có metadataBase từ NEXT_PUBLIC_SITE_URL và mặc định ANTIGRAVITY.STORE/vi_VN. Metadata route cụ thể cần kiểm riêng, không suy ra mọi trang đã có SEO localized hoàn chỉnh.

`/~offline` ngoài locale, fallback về tiếng Việt và link `/vi`; đây là khoảng trống localization đã biết. Serwist dùng `src/pwa/sw.ts`, build ra `public/sw.js`, đăng ký ở production và tắt trong development. Worker dùng defaultCache, document fallback `~offline`, skipWaiting/clientsClaim/navigationPreload; không hứa offline checkout.

MSW server khởi động qua instrumentation Node; browser khởi động qua shared API-mocking helper khi flag bật. Serwist và MSW là hai service-worker responsibility khác nhau: tránh suy luận hành vi production từ dev MSW; kiểm cache, registration và network trong browser khi đổi chúng. Xem [API boundary](api-integration.md).

## 3D trong storefront

| Surface   | Owner                                                                | Gate hiện tại                                                   |
| --------- | -------------------------------------------------------------------- | --------------------------------------------------------------- |
| Home Hero | `src/features/home/components/hero3d/HeroSlides3D.tsx`               | HeroCarousel dynamic import `ssr: false`, useCanRender3D        |
| PDP       | `src/features/catalog/product-detail/components/ProductViewer3D.tsx` | ProductInfoPanel dynamic import `ssr: false`, chỉ khi PDP mount |

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

Đây là baseline lịch sử, chưa đo lại trong đợt docs. Đo lại khi thay thời điểm mount; không dùng chênh lệch này làm chứng nhận hiệu năng hiện tại. [Home-motion](reference/home-motion/README.md) giữ provenance và checklist regression.
