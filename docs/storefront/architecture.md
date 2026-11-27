# Kiến trúc hiện tại

Đối chiếu checkout ngày 27/11/2026. Migration module và các slice SSR (ticket 34–48) đã hoàn tất; [thiết kế ticket 16](plan/done/16-storefront-refactor-map/design.md) giữ bối cảnh lịch sử, [ADR 0001](../adr/0001-domain-modules-and-readable-names.md) giữ quyết định.

## Cấu trúc và dependency

| Vị trí                                          | Trách nhiệm                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------------- |
| `src/app`                                       | Entry point Next.js, layout, metadata và composition mỏng                       |
| `src/modules`                                   | Catalog, home, auth, account, cart, wishlist, checkout, orders                  |
| `src/providers`                                 | QueryClient, session runtime, theme và provider dùng chung                      |
| `src/layouts`                                   | Header, footer, navigation, error UI và composition giữa module                 |
| `src/integrations/backend`                      | HTTP, endpoints/mapper, schema, generated contract, MSW và public server reader |
| `src/shared`                                    | UI primitive và helper dùng xuyên nghiệp vụ                                     |
| `src/i18n`, `src/lang`, `src/styles`, `src/pwa` | Locale, bản dịch, giao diện và service worker                                   |
| `src/testing`, `e2e`                            | Helper kiểm thử và browser journeys                                             |

Route/layout phối hợp module; module dùng shared và integration. Shared/integration không import ngược module hoặc app. `src/features` đã được gỡ; module chỉ dùng public entry được cho phép, không deep import hay tạo barrel.

`pnpm lint` chạy ESLint boundary và `scripts/check-module-boundaries.ts`: kiểm entry theo consumer/file/symbol, dependency cycle, coverage manifest và ngoại lệ hết hạn. Ma trận chi tiết ở [ticket 18](plan/done/18-storefront-module-boundaries/boundaries.md), convention tại [rule map](../agents/code-conventions.md).

Catalog nhận wishlist slot qua props; `layouts/catalog/CatalogWishlistAction` sở hữu phần nối. Wishlist dùng public catalog API theo chiều một chiều. Test dùng private source cùng owner; test khác module phải theo public/test entry cho phép.

## State và provider

| Dữ liệu                  | Owner                                     |
| ------------------------ | ----------------------------------------- |
| Server data/cache        | TanStack Query, query key theo module     |
| Shared client state      | Zustand cho session, cart, wishlist và UI |
| Form                     | React Hook Form và schema của chức năng   |
| Filter, sort, pagination | URL                                       |
| Tương tác cục bộ         | State của component                       |

Root mount `Providers` một lần; QueryClient browser được tạo bằng lazy state. Locale layout cấp messages, không mount lại session/query/theme. AuthRuntimeProvider đăng ký adapter với HTTP runtime rồi unregister khi cleanup; HTTP không import module auth.

Token hiện nằm trong memory; mock session không tự khôi phục sau F5. Không lưu token vào localStorage để che giới hạn. Session, Guest cart và merge thật thuộc [roadmap](roadmap.md).

## SSR public catalog

| Route dưới `/[locale]` | Phạm vi prefetch                        |
| ---------------------- | --------------------------------------- |
| `/products`            | Danh sách và bộ lọc catalog             |
| `/categories/[slug]`   | Cây danh mục và sản phẩm theo slug      |
| `/search`              | Kết quả theo query và page              |
| `/products/[slug]`     | Sản phẩm và related products            |
| `/home`                | Danh mục nổi bật và 5 sản phẩm mới nhất |

Page dùng prefetch trong `modules/catalog/server/prefetchCatalog.ts`, QueryClient riêng từng request và `HydrationBoundary`; query key/shape dùng chung với hook browser. Chỉ dehydrate query thành công; query lỗi để client thử lại. Không ISR hoặc persistent cache.

Category ưu tiên slug từ path; slug lạ giữ UI không tìm thấy. Search rỗng không gọi Backend. PDP 404 giữ `null`; lỗi related không làm mất product, lựa chọn variant vẫn ở client. Transport chi tiết ở [public server reader](api-integration.md#public-server-reader-ssr).

## Locale, PWA và kiểm chứng

`next-intl` hỗ trợ `vi`/`en`; route động lấy locale từ proxy/request config. Root layout nằm trên `[locale]`, nên chưa chuyển sang `next/root-params`; không dùng setter static-render đã deprecated. `~offline` nằm ngoài locale, còn tiếng Việt và link `/vi`; metadata từng route cần kiểm riêng. Serwist chạy production (`src/pwa/sw.ts` → `public/sw.js`), tắt ở development; không hứa offline checkout.

MSW hỗ trợ flow chuyển tiếp khi bật mock. Playwright có HTTP catalog harness và cấu hình production Chromium; các slice SSR hiện có bằng chứng unit/HTTP-level, chưa có assertion production browser riêng cho SSR theo quyết định 26/11/2026. Không suy ra toàn bộ SSR/PWA đã được E2E xác minh.

## 3D trong storefront

- Hero: dynamic import `ssr: false`, `useCanRender3D`, idle/timer và fallback 2D. PDP: chỉ dynamic import khi mount; chưa dùng cùng capability gate với Hero.
- Không import `three`/React Three từ route/layout chung. `drei` hiện chỉ ở PDP; không thêm HDR CDN dependency cho surface mới.
- DOM giữ link, focus, ARIA và autoplay; WebGL chỉ vẽ pixel. Reduced motion, poster và CTA phải hoạt động khi WebGL lỗi.
- Khi sửa scene, kiểm pause rAF ngoài viewport/tab ẩn, dispose texture/material và fallback 2D khi context lost. Hero ảnh DOM và canvas phải đồng bộ để không mất focus/feedback.
- Shader uniforms phải có khi ShaderMaterial khởi tạo; gán muộn có thể gây canvas đen. Không dùng backtick trong comment GLSL của TypeScript template literal; `active` là từ khóa GLSL dành riêng.
- Baseline lịch sử 30/08/2026: Chromium 390×844, CPU 4×, 1.6 Mbps/150 ms, trung vị 3 lần; LCP WebGL 1524 ms, tắt gate/reduced motion 1516 ms. Chưa đo lại; không coi là hiệu năng hiện tại. Rà animation cũ tại commit `30961c2`.

Các surface mới cần quyết định về gate/fallback; không tự mở rộng 3D sang grid, filter, cart, auth hoặc checkout. Visual contract ở [design](../../design.md).
