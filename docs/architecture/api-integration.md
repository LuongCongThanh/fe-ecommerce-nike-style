# Tích hợp API

Storefront sở hữu client, Backend sở hữu domain/transport, CMS sở hữu back-office. Đối chiếu source ngày 27/11/2026; mọi HTTP và contract nằm trong `src/integrations/backend`.

## Proxy và môi trường

| Nơi gọi             | Đường đi                                                                   |
| ------------------- | -------------------------------------------------------------------------- |
| Browser catalog     | `/api/v1/*` cùng origin → rewrite trong `next.config.ts` → `API_ORIGIN`    |
| Node catalog client | `API_BASE_URL` từ `NEXT_PUBLIC_SITE_URL`, mặc định `http://localhost:3000` |
| Public SSR reader   | Gọi thẳng `API_ORIGIN` + `/api/v1`                                         |

`API_ORIGIN` mặc định `http://localhost:8080`. Khai báo local theo `.env.example`, giữ origin nhất quán. `NEXT_PUBLIC_APP_URL`/`NEXT_PUBLIC_API_URL` còn được app/client sử dụng; không bỏ chỉ vì catalog có đường riêng. Same-origin proxy không chứng minh cookie auth thật đã hoạt động; không đặt secret trong biến `NEXT_PUBLIC_*`.

## Contract pin và mapper

`scripts/gen-api.mjs` pin `be-demo/openapi-v0.7.0/openapi.json`. `pnpm gen:api` sinh `src/integrations/backend/generated/openapi.ts`; `OPENAPI_URL` cho phép thử URL/local path khác. Không sửa generated file bằng tay. CI regenerate và kiểm diff.

Endpoint catalog dùng generated schemas; mapper thuần ở `endpoints/catalog.mapper.ts`, model ở `models/catalog.ts`. Component dùng model, không đoán DTO từ contract mới hơn. Pin catalog không chứng minh checkout/auth đã cutover.

`contract-bump.yml` và `scripts/contract-bump.sh` dùng `CONTRACT_BUMP_TOKEN` (Contents + Pull requests read/write), thiếu token thì bỏ qua. Workflow mở PR vào `dev`: patch tự squash merge khi CI xanh; minor được xử lý là breaking change và chờ sửa caller. Chỉ giữ một PR bump mở.

Khi bump: xác minh release → cập nhật pin → gen:api → typecheck/focused tests → sửa caller → lint/build. Thay đổi UI/domain cần quyết định trước; quy tắc Git theo [CONTRIBUTING](../../CONTRIBUTING.md).

## Public server reader (SSR)

`server/catalog.ts` cung cấp reader products, product slug, category tree, sizes và colors; dùng chung mapper với browser. `server/http.ts` có `server-only`, `cache: 'no-store'`, `credentials: 'omit'`, không cookie/Authorization, không auth adapter/refresh, timeout 5 giây và không retry.

Lỗi thành `ApiError`: network/timeout có status 0; code gồm `NETWORK_ERROR`, `REQUEST_TIMEOUT`, `INVALID_RESPONSE`. Request-scoped prefetch, hydration và danh sách route hiện có nằm trong [kiến trúc SSR](README.md#ssr-public-catalog).

## MSW boundary

Mock chỉ bật khi `NEXT_PUBLIC_API_MOCKING` đúng chuỗi `true`. Server khởi động qua instrumentation; browser chờ worker sẵn sàng. Handler chuyển tiếp auth/profile/address/cart/wishlist/checkout/orders; catalog `/api/v1` vẫn gọi API thật, unhandled request bypass.

Fixture/persistence phục vụ dev/test. Token mock ở memory, reload mất session. Tắt flag không tự làm endpoint, DTO hoặc session tương thích API thật; giữ handler đến khi flow tương ứng cutover và có regression checks.

## Trước khi cutover một flow

1. Xác minh endpoint và contract đã phát hành; đối chiếu request/response/error, session và ownership.
2. Map DTO tại integration; kiểm loading/empty/error/retry, query invalidation và `vi`/`en`.
3. Chạy focused integration và hành trình browser với API thật; chỉ gỡ mock của flow đã có bằng chứng.
4. Giữ giá/stock/quote/idempotency/payment/return do API quyết định; xem [roadmap](../plan/roadmap.md) cho dependency còn mở.

Nguồn nghiệp vụ thuộc `be-demo/GLOSSARY.md`, ADR và OpenAPI của Backend; thuật ngữ kỹ thuật CMS thuộc repo `cms`. Hai consumer không gọi nhau; sibling repo không bắt buộc có trong checkout frontend.
