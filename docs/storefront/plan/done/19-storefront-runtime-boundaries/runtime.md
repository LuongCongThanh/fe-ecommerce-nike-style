# Runtime Storefront — quyết định đã chốt

Ngày chốt 24/11/2026. Người dùng đã đồng ý sáu lựa chọn qua ba vòng trao đổi. Đây là quyết định lập kế hoạch, chưa phải quyền triển khai source. Dựa source hiện tại, inventory và quyết định public boundary đã chốt.

## Baseline đã đối chiếu

- Root layout import AppProviders; locale layout sở hữu NextIntlClientProvider/setRequestLocale. AppProviders là client entry, tạo QueryClient bằng useState; AuthRuntimeProvider bao ngoài QueryClientProvider rồi theme/motion. Giữ toaster/progress một owner.
- AuthRuntimeProvider đăng ký adapter trước bootstrapAuth, trả unregister để cleanup. Adapter singleton và inFlightRefresh trong SDK là hiện trạng; không dùng làm state session giữa SSR requests.
- Auth store giữ access/refresh token trong memory; bootstrap không có refresh token thì clearAuth/anonymous ngay, không gọi refresh network. Reload thật không phục hồi mock session. Same-origin proxy và Axios withCredentials không chứng minh cookie auth đã cutover.
- SDK catalog chọn relative /api/v1 trong browser và API_BASE_URL tuyệt đối trong Node; endpoint khác dùng đường /api mock hiện tại. Đổi path source không đổi URL, mapper, pin, lỗi hoặc retry.
- adapters/server chỉ enable MSW Node qua instrumentation; browser bootstrap memoize worker readiness. Đây không phải hai authenticated HTTP client độc lập.
- AppProviders.test hiện mô tả cache giữ khi localized children đổi, bootstrap một lần trong mount test thường, một toaster/progress và adapter cleanup. Không suy rộng thành guarantee đúng một effect khi StrictMode remount.
- Server order read ở checkout success gọi getOrderOrNull và giữ fallback orderId khi không đọc được order; không sửa auth flow để làm order SSR thành công trong rename.

## Hai hướng đã được đồng ý ngày 24/11/2026

1. Migration cơ học giữ nguyên mount/lifecycle/session/cache/mock/PWA, không ghép sửa auth/cookie hay SSR vào rename. Runtime markers phải xét consumer thật, không gắn client-only cho toàn SDK đang có server callers.
2. Map bao gồm quyết định thiết kế SSR public catalog; implementation là delivery slice riêng sau migration ổn định. Không đẩy các quyết định thiết kế SSR sang một effort chưa được định nghĩa.

## Transport/cache đã được đồng ý ngày 24/11/2026

### Transport public phía server

- Tạo entry server-only riêng dưới `integrations/backend/server/` cho các GET catalog công khai khi triển khai SSR; không đọc/register AuthRuntimeAdapter, không dùng inFlightRefresh hoặc auth store browser.
- Không chuyển cookie/Authorization của người dùng vào request public; không refresh session ở server public reader. Authenticated SSR (orders/account/cart) vẫn ngoài scope; giữ checkout success fallback hiện tại.
- Transport server đi trực tiếp origin Backend do config server quản lý, giữ path `/api/v1` và mapping/error semantics; không gọi vòng qua chính Next server trong render/build. Browser giữ relative same-origin proxy. Chỉ thêm reader khi SSR slice cần; migration cơ học không tự đổi endpoint/env.
- Chia sẻ mapper/schema/type thuần giữa hai transport; không nhân đôi shape/validation hoặc tạo interface cho mọi endpoint. Nếu cần extract mapper đang private trong endpoint, chuyển cùng test trong SSR slice.
- CatalogKeys/query normalization dùng được cả server/client, không kéo hooks hoặc browser store vào server graph. File server-only và browser bootstrap có guard đúng entry; mock shared handlers/models không bị gắn marker hàng loạt.

### Cache và hydration

- SSR QueryClient riêng theo request/render scope; không cache session hoặc giữ QueryClient toàn process. Chỉ dehydrate public catalog queries cần cho trang.
- Prefetch bằng cùng catalogKeys và cùng query normalization/dạng dữ liệu với hook hiện tại; ví dụ categories hydrate `{tree, flat}`, không hydrate raw tree vào key mà hook mong object.
- HydrationBoundary dùng QueryClient browser đang có ở root; giữ staleTime thực tế: mặc định 60 giây, categories/sizes/colors 10 phút; giữ browser retry/focus/placeholder policy hiện tại.
- Đợt SSR đầu không thêm persistent data cache/ISR cho Backend data; server reader dùng no-store, không lấy staleTime browser làm TTL cache server. Không nâng dependency để theo docs mới.
- Phép đo duplicate request chỉ kỳ vọng không fetch lại ngay khi query đã hydrate còn fresh và key/input khớp; không hứa tuyệt đối 0 request dưới mọi điều kiện network/stale/navigation.

## Phạm vi và fallback đã được đồng ý ngày 24/11/2026

### Phạm vi SSR public catalog

Áp cùng contract cho cả vi/en và chỉ dữ liệu API đã có consumer; chia delivery nhỏ, bắt đầu products, không đòi một PR chuyển hết.

| Trang / khu vực               | Dữ liệu server prefetch                                                       | Điều kiện giữ behavior                                                                 |
| ----------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `/[locale]/products`          | Products theo URL filters/page/sort; category tree, sizes/colors mà UI cần    | Dùng normalization hiện tại, PAGE_SIZE 12; không đổi URL hoặc enum mapping             |
| `/[locale]/categories/[slug]` | Category tree trước để resolve slug/id; products đúng category và URL options | Không resolve được slug thì không gọi products với categoryId undefined                |
| `/[locale]/search`            | Search đúng q trim/page, chỉ khi q không rỗng                                 | Giữ key search riêng, không trộn filter PLP                                            |
| `/[locale]/products/[slug]`   | Product detail; related products khi đã biết category và có consumer hiện tại | Giữ null cho API 404 và stock/variant/mapping đang có; không mở AddToCart              |
| `/[locale]/home`              | Featured category tree và new arrivals query đang gọi API                     | Không SSR thêm dữ liệu fixture/hero3D/newsletter; không tự thay mock section thành API |

Query policy/shape thuộc catalog, reader/HTTP/mapper thuộc integration. Route chỉ gọi catalog server entry mỏng, phần prefetch/dehydrate đặt dưới `modules/catalog/server/`; có wrapper client composition ngoài app nếu cần render action. Home có thể dùng catalog server entry công khai đúng các query trên, không import private server helpers. Chi tiết tên file/symbol ghi cùng delivery spec; không thêm HTTP ngoài integration. Không thêm personalized data, session hay token vào HTML/hydrated state.

### Lỗi và fallback

- SSR public read có abort timeout 5 giây cho mỗi request HTTP, không tự retry phía server trong đợt đầu; browser giữ retry hiện tại. Đây là lựa chọn cho runtime SSR mới, không áp ngược vào migration giữ behavior.
- Chỉ dehydrate queries thành công. Timeout/network/5xx không biến thành danh mục/sản phẩm không tồn tại và không serialize Error/raw payload: bỏ query đó khỏi hydration, giữ shell/loading để hook browser đọc lại bằng đường hiện có và hiện error/retry hiện có nếu vẫn thất bại.
- Product API 404 vẫn chuyển thành null ở cùng key/shape và hiển thị thông báo không tìm thấy như hiện tại. Category tree đọc thành công nhưng không có slug thì giữ UI không tìm thấy và không prefetch products. Không tự thêm Next notFound(), redirect, HTTP status/SEO semantics mới.
- Lỗi query phụ không hủy query chính đã thành công; không render UI công khai lỗi raw Backend. HTML có nội dung catalog khi request thành công; khi Backend thất bại có thể là shell, không tuyên bố SSR luôn có nội dung.

## Mapping runtime để bàn giao

| Nguồn hiện tại                                                    | Đích / trách nhiệm                                         | Boundary phải giữ                                                                                    |
| ----------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `app/_composition/AppProviders.tsx` + test                        | `providers/AppProviders.tsx` + test                        | Root mount; QueryClient per mount; auth→query→theme/motion; toaster/progress một owner               |
| `shared/lib/query-client.ts`                                      | `providers/query-client.ts`                                | Giữ browser retry/staleTime/focus và mutation toast policy                                           |
| `features/auth/session/AuthRuntimeProvider.tsx`                   | `modules/auth/session/AuthRuntimeProvider.tsx`             | Register trước bootstrap; cleanup identity; không register user adapter trong Node                   |
| `features/storefront-shell/**`                                    | `layouts/**`                                               | Giữ guest merge và header/footer; không mount provider trùng                                         |
| `lib/api/client/**`                                               | `integrations/backend/client/**`                           | Legacy transport giữ behavior và server caller hiện tại; không gắn client-only toàn folder           |
| `lib/api/endpoints/**`                                            | `integrations/backend/endpoints/**`                        | Giữ URL, method, error class, request/response mapping; không ngầm cutover                           |
| `lib/schemas/**`                                                  | `integrations/backend/schemas/**`                          | Transport schema; schema form vẫn thuộc module                                                       |
| `lib/api/models/**`, `generated/**`                               | `integrations/backend/models/**`, `generated/**`           | Giữ type/model và contract pin; không sửa generated bằng tay                                         |
| `lib/api/env/**`                                                  | `integrations/backend/env/**`                              | Giữ env fallback và VITE compatibility hiện tại trong rename; server reader dùng config server riêng |
| `lib/api/adapters/browser.ts`, `server.ts`                        | `integrations/backend/adapters/browser.ts`, `server.ts`    | Chỉ MSW bootstrap, không giả là auth SSR transport                                                   |
| `lib/api/testing/**`, `mocks/**`                                  | `integrations/backend/testing/**`, `mocks/**`              | msw/browser và msw/node tách entry; handler/fixture chung, unhandled bypass                          |
| `shared/lib/api-mocking.ts`                                       | `integrations/backend/adapters/browser-bootstrap.ts`       | Memoized readiness; flag đúng chuỗi true                                                             |
| `src/instrumentation.ts`, `instrumentation.node.ts`               | Giữ vị trí, sửa import                                     | Giữ NEXT_RUNTIME nodejs dynamic guard; không kéo msw/node vào browser/Edge                           |
| `scripts/gen-api.mjs`, `package.json`, `.github/workflows/ci.yml` | Giữ owner, sửa generated output/format/diff path cùng lượt | Giữ pin openapi-v0.5.0 và nội dung contract                                                          |
| `src/pwa/sw.ts`, `next.config.ts`, public assets                  | Giữ vai trò/path                                           | MSW worker khác Serwist; giữ offline fallback, production register và rewrite/browser origin         |
| Reader public SSR mới                                             | `integrations/backend/server/`                             | Chỉ thêm ở SSR delivery; server-only, không browser singleton/session, no-store                      |

Các reader server mới dùng config `API_ORIGIN` server hiện có; không đưa server config/secret vào NEXT_PUBLIC. QueryClient SSR mới không tái dùng makeQueryClient browser nếu kéo auth/session hoặc mutation side effect vào server. Shared schemas/models/generated không được gắn server-only vì cả hai runtime dùng.

## Boundary protection, bằng chứng và rollback

- Enforce server entry không vào client graph, browser bootstrap/auth store không vào server public reader; modules/catalog/server không import React client hook. Không đánh đồng file importable trong Node với authenticated request isolation.
- Migration: provider/layout tests giữ cache và locale; auth-store tests cho no-refresh/success/failure; SDK/MSW tests giữ semantics; build bắt import Node/browser và generator output; browser kiểm vi/en, session/navigation, toaster/progress và offline. Các test này hiện chỉ được đọc trong phiên planning, chưa chạy.
- SSR: kiểm public HTML khi API thành công, query key/shape/normalization, hai request độc lập không chia QueryClient/session, không có cookie/token trong request public/payload, không fetch lại ngay khi fresh, category thiếu slug không gọi products, lỗi/timeout fallback và 404/null. Đo requests phân biệt server fetch với browser fetch, cold load với navigation, dev với production.
- Build/HTTP integration cần môi trường Backend/fixture rõ ở delivery; không dùng Vitest reader unit test để tuyên bố async RSC đã chạy. SSR lỗi không được làm test xanh bằng bỏ gate; kiểm migration và SSR riêng.
- Rollback migration theo slice gồm source/import/config/docs cùng lượt; không để generated path/CI khác nhau. Rollback SSR bỏ server prefetch/HydrationBoundary/reader integration của slice, trở về client query có sẵn; không revert migration đã ổn định, auth contract hay PWA.
- **Cần giữ hoặc bổ sung bằng chứng nào để xác nhận refactor không đổi hành vi?** chốt ma trận lệnh/môi trường/điều kiện đạt cụ thể; **Chia các đợt triển khai và blocker thế nào để mỗi đợt có thể build và kiểm tra độc lập?** chốt file scope, thứ tự và bridge removal. Không tự tạo delivery ready hoặc đổi status delivery.

## Nguồn tham khảo kỹ thuật

- [TanStack Query — Advanced Server Rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr): prefetch/dehydrate/HydrationBoundary, ownership QueryClient và freshness. Đây là hướng cơ chế, không bằng chứng checkout đã có hydration.
- [Next.js — fetch](https://nextjs.org/docs/app/api-reference/functions/fetch): explicit cache policy phía server. Tài liệu online có thể mới hơn pin Next 16.2 của checkout; SSR delivery phải xác minh bằng installed version/build, không tự nâng pin.
