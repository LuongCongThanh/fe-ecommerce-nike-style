# Tích hợp API hiện tại

Owner: maintainer storefront cho client; `be-demo` sở hữu transport/domain phía server, `cms` sở hữu back-office. Ngày đối chiếu 18/11/2026. Không import source backend hoặc gọi API ngoài `src/integrations/backend`.

## Proxy và môi trường

Browser catalog gọi `/api/v1/*` cùng origin. `next.config.ts` rewrite sang `${API_ORIGIN}/api/v1/*` (mặc định backend localhost:8080); Node catalog cần URL tuyệt đối và lấy origin frontend từ NEXT_PUBLIC_SITE_URL qua API_BASE_URL. Khai báo local trong `.env.example`, giữ các origin nhất quán. NEXT_PUBLIC_APP_URL/NEXT_PUBLIC_API_URL còn được app/client sử dụng; không đổi chúng chỉ vì catalog có đường riêng.

Same-origin proxy giữ cookie first-party và tránh browser gọi backend cross-origin. Nó không chứng minh auth mock đã chuyển sang cookie thật. Không đưa gateway/storage secret vào biến NEXT_PUBLIC.

## Contract pin và mapper

`scripts/gen-api.mjs` pin release asset `be-demo/openapi-v0.7.0/openapi.json`; `OPENAPI_URL` có thể override URL hoặc local path để thử. `pnpm gen:api` sinh `src/integrations/backend/generated/openapi.ts` rồi format. Không sửa file sinh bằng tay. CI regenerate rồi kiểm diff với contract pin; cần truy cập nguồn contract.

Catalog endpoints dùng generated schemas cho products, product slug, categories, sizes và colors. Mapper chuyển DTO sang model trong `src/integrations/backend/models/catalog.ts`; null ảnh bị loại, description null thành chuỗi rỗng. Component dùng model, không đoán field từ contract mới hơn. Pin hiện tại không phải bằng chứng toàn bộ checkout/auth API đã tích hợp.

Workflow `contract-bump.yml` (`scripts/contract-bump.sh`) mở PR `chore/contract-openapi-v*` khi be-demo phát hành tag mới: patch tự squash merge khi CI xanh; minor (breaking change) gắn nhãn `breaking-contract` và chờ người sửa caller trên chính nhánh đó. Mỗi lúc chỉ một PR như vậy. Cần secret `CONTRACT_BUMP_TOKEN` (PAT fine-grained cho repo này, Contents + Pull requests read/write); thiếu secret thì workflow bỏ qua.

Khi sửa PR breaking hoặc bump tay: kiểm release/contract cần dùng, cập nhật pin, gen:api, typecheck để tìm caller bị ảnh hưởng, xử lý break cơ học, dừng chốt quyết định nếu break đổi UI/domain, sau đó lint/build và focused tests. Không tự nâng pin theo tài liệu này. Git/PR vẫn theo CONTRIBUTING và quyền phiên hiện tại.

## Public server reader (SSR)

`src/integrations/backend/server/catalog.ts` đọc catalog công khai cho Server Components: `getProductsServer`, `getProductBySlugServer`, `getCategoryTreeServer`, `getSizesServer`, `getColorsServer`. Transport nằm ở `server/http.ts` (`import 'server-only'`): `fetch` thẳng tới `API_ORIGIN` (server-only, mặc định `http://localhost:8080`) + `/api/v1`, `cache: 'no-store'`, `credentials: 'omit'`, không cookie/Authorization, không đọc auth adapter hay refresh, timeout 5 giây mỗi request, không retry. Lỗi thành `ApiError` (`status` 0 cho timeout/network, code `REQUEST_TIMEOUT`/`NETWORK_ERROR`/`INVALID_RESPONSE`). Mapper thuần dùng chung với endpoint browser nằm ở `endpoints/catalog.mapper.ts`; ghép query string ở `client/query-string.ts`. Hiện `/[locale]/products` và `/[locale]/home` (qua `prefetchHome`) dùng reader này; category, search, PDP và home vẫn đọc client-side cho tới các slice SSR kế tiếp.

## MSW boundary

`src/integrations/backend/env/config.ts` chỉ bật mocking khi flag đúng chuỗi `true`. Server adapter bật MSW qua instrumentation; browser helper bảo đảm worker sẵn sàng trước request chuyển tiếp. Unhandled requests bypass; handlers trong `src/integrations/backend/mocks/handlers.ts` giữ các flow auth/profile/address/cart/wishlist/checkout/orders chưa cutover. Catalog `/api/v1` vẫn đi API thật.

Fixtures và persistence chỉ hỗ trợ dev/test; không bảo đảm dữ liệu giống backend. Tắt flag không tự đổi endpoint/DTO/session. Mock refresh token nằm trong memory và session mất sau reload thật. Giữ MSW cho flow chưa có contract đã xác minh; gỡ từng handler sau cutover và regression tương ứng.

## Cutover seam và nguồn liên repo

Business docs/glossary của API giữ nghĩa nghiệp vụ; executable OpenAPI giữ transport. Storefront và CMS không gọi nhau. Repo này giữ frontend dependency trong [roadmap](roadmap.md), không giữ lại cây backend/CMS dài hoặc quy trình migration database như hướng dẫn frontend.

Nguồn ngoài checkout frontend: `be-demo/GLOSSARY.md`, `be-demo/docs/architecture/`, `be-demo/docs/adr/`, `be-demo/docs/openapi/openapi.json`; CMS có `cms/docs/plans/cms-restructure-plan.md` và `cms/GLOSSARY.md` cho thuật ngữ kỹ thuật Vue/session. Đây là đường trong sibling repos, không phải file bắt buộc có khi chỉ checkout frontend. GLOSSARY root nếu có đọc theo chủ đề; không tự tạo hoặc sửa để thay contract API.

Trước cutover một flow: xác minh tag và endpoint chạy được, map request/response/error, session/ownership, loading/empty/error/retry, query invalidation và i18n; chạy focused integration và browser journey với API thật. Chỉ xóa mock tương ứng khi đã có bằng chứng. Quote, idempotency, cart merge, payment callbacks và returns có invariants riêng trong roadmap; không triển khai chúng bằng logic UI tự suy diễn.
