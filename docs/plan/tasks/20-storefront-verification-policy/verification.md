# Chính sách kiểm chứng migration Storefront — quyết định đã chốt

Ngày chốt 24/11/2026. Người dùng đã đồng ý bốn lựa chọn qua hai vòng trao đổi. Scope là quyết định bằng chứng và quyền test cho delivery, không chạy suite hoặc thay đổi test/source trong planning.

## Bằng chứng hiện có và giới hạn

- CI `.github/workflows/ci.yml` chạy docs, lint/format, gen:api + generated diff, typecheck, unit tests và build; chưa có job E2E hoặc test:coverage. Không được gọi CI xanh là đã chứng minh browser/coverage/SSR.
- `playwright.config.ts` chạy pnpm dev, ba engine Chromium/Firefox/WebKit, hỗ trợ PLAYWRIGHT_BASE_URL; mặc định chưa chạy production server. Serwist disabled ở development; providers.spec truy cập /~offline trực tiếp không chứng minh service-worker fallback khi mạng mất.
- `e2e/catalog.spec.ts` còn kỳ vọng Shoes/Running, 24 mock products. Catalog `/api/v1` dùng Backend thật; flag MSW không cung cấp taxonomy đó.
- `e2e/pdp.spec.ts` và `e2e/checkout.spec.ts` kỳ vọng mua từ PDP; source AddToCartSection đang disabled/Sắp mở bán. Đây là đối chiếu tĩnh, chưa phải kết quả chạy thất bại. Không được bật tính năng cũ để cứu test trong migration.
- Unit/integration hiện có: provider/root/locale lifecycle; auth bootstrap; cart/wishlist hooks; catalog URL/variant/price; schema/error; checkout reservation/order lifecycle qua MSW; SDK endpoints. Hành vi mới tại composition/lint và SSR cần bằng chứng bổ sung ở đúng boundary.
- Coverage include/exclude đang gắn shared/lib/hooks/stores/ui/utils; threshold 99 cho lines/functions/branches/statements. Chuyển path không được làm rơi file khỏi tập coverage hoặc thay denominator để che thiếu assertion.
- Tên test trong các bảng dưới là path hiện tại, cần đổi cùng owner/basename. Test đã đọc không được ghi là pass. Baseline runtime thật của checkout hiện chưa đo.

## Baseline và quyền test đã được đồng ý ngày 24/11/2026

1. Baseline lỗi có sẵn: ghi HEAD/worktree, môi trường, command, failure artifact trước slice; so cùng điều kiện sau slice. Nếu test bắt buộc hoặc flow bị tác động đang lệch source, sửa harness/assertion/fixture đúng behavior hiện tại thành prerequisite trước hoặc ở đầu delivery slice. Không bỏ test/giảm gate/tăng retry để né; lỗi ngoài scope báo riêng nhưng không tuyên bố gate pass hoặc tự miễn CI bắt buộc.
2. Quyền test: delivery spec có allow-test-changes: true với file scope cụ thể cho đổi import/mock path, colocation/suffix và thay cách setup phù hợp public boundary. Giữ ý nghĩa behavior assertion; chỉ bổ sung hồi quy cho risk thật (slot action, cycle/private imports, runtime lifecycle, SSR). Không test cho mỗi rename/suffix/type; không tự nâng quyền mọi test hoặc viết lại suite.

## Ma trận kiểm chứng đã chốt

| Thay đổi / risk                       | Bằng chứng thấp nhất có giá trị                                                                                     | Lệnh / điều kiện áp dụng                                                        | Điều kiện đạt / dừng                                                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Rename source/test và path consumer   | Test owner cũ chạy ở path mới; typecheck/lint, rà path literal còn lại                                              | pnpm exec vitest run <test-files>; pnpm typecheck; pnpm lint                    | Assertion semantics giữ nguyên; không mất test/consumer hoặc tắt rule                                                    |
| Public allowlist / module DAG         | Config fixture: allowed import pass; private/wrong-symbol/cycle fail; test exemption đúng owner                     | Focused lint/config check theo delivery spec + pnpm lint                        | Cả case hợp lệ và case cấm được chứng minh, không chỉ grep tên file                                                      |
| ProductCard wishlist composition      | Interaction heart label/aria-pressed/toggle, click không điều hướng; showWishlist=false không bật action            | ProductCard.test và test client composition mới; browser catalog smoke          | Card không import wishlist; action cũ giữ behavior, PDP disabled giữ nguyên                                              |
| Providers/root/locale                 | AppProviders.test, app/layout.test, auth-store.test; browser vi/en + offline route                                  | Focused Vitest; playwright e2e/providers.spec.ts --project=chromium; build      | Cache/lifecycle, adapter cleanup, một notification surface; không suy guarantee mọi StrictMode từ test rerender          |
| SDK/schema/mapper/generated           | Endpoint+MSW, schema/error tests, DTO mapper tests nếu extract; generator pin/diff                                  | Focused Vitest; gen:api + generated diff đúng path; build                       | URL/method/body/error/null semantics/pin giữ nguyên; không regenerate contract mới ngoài scope                           |
| Cart/wishlist/checkout/orders/account | Hook/store/checkout-flow/order lifecycle tests; browser flow đã sửa baseline                                        | Focused tests rồi full unit; full E2E nếu flow/routing/auth/storage bị tác động | Reservation/idempotency/merge/cache/error không đổi; không dùng PDP mua hàng đã disabled làm setup                       |
| Shared helper relocation              | Test helper và consumer thực tế; coverage mapping cũ→mới                                                            | Focused tests; pnpm test:coverage khi slice chạm collected files/globs          | Tập file tương đương và threshold giữ; inactive helper không tự bị xóa                                                   |
| MSW bootstrap/Node boundaries         | server adapter test, browser worker readiness, build; mocks off catalog path                                        | Focused tests + browser/build                                                   | Node-only package không vào client; production bypass không đổi; test MSW dùng error cho unexpected request theo rule    |
| SSR public reader isolation           | HTTP harness ghi method/path/header; hai request độc lập, timeout/abort/no retry; mapper/error tests                | Test reader/HTTP integration mới (delivery định nghĩa file)                     | Không cookie/token/auth singleton; no-store; timeout 5 giây có test fake clock/controlled delay                          |
| SSR query/hydration                   | Key normalization/shape, categories tree+flat, dataUpdatedAt/freshness, category missing, search q rỗng             | Pure/query integration test và production browser test mới                      | Không fetch ngay lại query fresh cùng input; không serialize error/session; browser policy giữ                           |
| SSR HTML/error fallback               | HTTP response HTML có dữ liệu fixture khi server thành công; browser hydrate; failure/404/UI retry                  | Production-mode Playwright + server-side Backend fixture/harness                | Không chỉ đọc DOM sau hydration; network error không thành not-found; async RSC không được coi proven bằng Vitest reader |
| PWA                                   | Production worker đăng ký, online cache theo policy cũ, chuyển offline rồi navigation phù hợp và /~offline fallback | Production browser run với service workers enabled, context sạch                | Tách MSW và Serwist, trace registration/cache/network; dev /~offline check không thay thế                                |

## Môi trường và gates đã được đồng ý ngày 24/11/2026

### Dữ liệu deterministic cho cả browser và SSR

- Harness HTTP catalog riêng trong test infrastructure, fixture bám Contract Version đang pin và đúng mapper/model hiện tại. Trỏ API_ORIGIN server về harness; browser tiếp tục gọi relative /api/v1 qua rewrite, server reader gọi cùng origin trực tiếp. Chỉ cấu hình test, không thêm API giả vào production hoặc viết source Backend/CMS.
- Fixture có product detail/list, category tree, sizes/colors, pagination/filter/search và case 404/empty/5xx/delay. Trả payload có nghĩa và assertion cụ thể; không tự sao chép thuật toán client để làm oracle. Dữ liệu định danh cố định, reset theo case/worker; tránh mutable global state giữa test chạy song song.
- Harness ghi method/path/query/header/count theo test để đo server request. Browser network instrumentation đo browser requests riêng. page.route không thay thế server harness; không dùng live production data làm baseline.
- Suite commerce vẫn giữ MSW cho flow chưa cutover; cart/checkout setup qua fixture/test entry được giới hạn, giữ schema và public boundary. Không dùng PDP đã disabled để seed cart, không thêm production bypass hoặc bật tính năng mua hàng.
- Harness chứng minh Storefront với controlled HTTP boundary, không chứng minh Backend thật. Contract pin/generated check vẫn bắt buộc theo CI; thực nghiệm Backend thật là evidence riêng khi có môi trường phù hợp, không thay mock commerce bằng request ghi thật trong migration.

### Gates áp dụng

- Giữ focused test trước, sau đó lint/format/docs/typecheck/test theo quy tắc repo. Build khi import graph/framework/routing/config/bundle đổi. Không thêm unit test cho suffix thuần.
- Slice chạm file trong tập coverage hoặc coverage glob phải chạy pnpm test:coverage; so mapping tập file cũ→mới và giữ ngưỡng 99. CI hiện chưa chạy coverage; delivery foundation bổ sung gate cho các slice này thay vì tuyên bố pnpm test đã enforce threshold.
- Flow/routing/auth/storage/E2E infrastructure thay đổi: focused Chromium trước, sau đó full pnpm test:e2e ba engine như rule hiện hành. Dùng baseline đã reconcile, không gọi suite đang dựa fixture cũ là bằng chứng hợp lệ.
- SSR và service-worker behavior: production build + pnpm start, cấu hình Playwright production riêng, không sửa default dev command toàn bộ app. Config production dùng server/port do test run sở hữu, không tái dùng nhầm dev server. API_ORIGIN và public origins khớp port, fixture harness readiness kiểm rõ.
- Thêm production SSR/PWA Chromium gate tự động trong CI trước khi chấp nhận các slice SSR/PWA hoặc đổi runtime có ảnh hưởng; với migration thuần không chạm SSR/PWA, build và evidence browser theo boundary vẫn áp dụng. Full E2E ba engine vẫn áp dụng theo trigger bên trên; Chromium service-worker proof không được ghi là đã chứng minh mọi engine.
- Chạy PWA riêng với NEXT_PUBLIC_API_MOCKING=false và context sạch, Service Workers enabled, chờ ready/controller rồi ngắt mạng. Kiểm một URL chưa có cached document để chứng minh /~offline fallback; kiểm document đã cache riêng nếu policy hiện hành có hỗ trợ. Không đánh đồng fallback với mở /~offline khi online.
- Config/harness/gate mới là deliverable foundation cần viết spec và kiểm trước consumer slice, không phải code đã tồn tại. Chính sách không thay approved.files/commands hoặc delivery status; mỗi spec cấp quyền đúng file/lệnh.

### Lệnh hiện có và lệnh cần bổ sung

| Mục đích                | Lệnh / điều kiện                                                                      | Trạng thái                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Focused unit/hook/SDK   | pnpm exec vitest run <test-files>                                                     | Có sẵn; chọn path cũ/mới theo slice                                                                 |
| Root gates              | pnpm lint; pnpm format:check; pnpm docs:check; pnpm typecheck; pnpm test; pnpm build  | Có sẵn; chỉ chạy gate đúng scope, chưa chạy trong planning ngoài docs                               |
| Coverage                | pnpm test:coverage                                                                    | Có sẵn; glob cần migrate cùng owner                                                                 |
| Focused browser         | pnpm exec playwright test <spec> --project=chromium                                   | Có sẵn; mặc định pnpm dev                                                                           |
| Full E2E                | pnpm test:e2e                                                                         | Có sẵn; cần reconcile fixture/assertion trước                                                       |
| Contract path migration | pnpm gen:api và git diff --exit-code <generated-path-đã-migrate>                      | Có sẵn; giữ pin, cần nguồn contract; không chạy trong planning                                      |
| Production SSR/PWA      | pnpm exec playwright test --config=playwright.production.config.ts --project=chromium | Config mới đã được chốt trong kế hoạch; chưa tồn tại/chưa thực thi được cho tới foundation delivery |

Các dấu chấm phẩy trong bảng chỉ liệt kê lệnh, không là yêu cầu chạy dồn khi chưa biết kết quả gate trước. Nếu dùng verify-gates/bundle gate hiện có, tuân quy trình baseline/candidate cùng checkout; không tạo worktree mới và không tuyên bố bundle/performance cải thiện khi chưa đo.

### Điều kiện đạt, artifact và rollback

- Report ghi HEAD/worktree, fixture/contract version, Node/package manager thực dùng, env mode (không secret), command/exit code, engine, dev/production, baseline so sánh và đường dẫn artifact. Không suy pin Node từ file không tồn tại; dùng config/toolchain thực tế ở delivery.
- SSR HTML assertion kiểm tên/giá/data marker hiện diện trong markup thực của HTTP response (không chỉ chuỗi trong RSC payload), dùng request không chạy JavaScript; sau đó browser kiểm hydration không mismatch và interaction/filter/navigation.
- Request count đo cold load không có prefetch navigation ngoài test, thời điểm hydration trước staleTime, cùng normalized key/input; backend harness phân loại server/browser. Query đã hydrate thành công còn fresh không request lại ngay; query mới/stale/failed được fetch theo policy, không áp tiêu chí 0 request toàn app.
- Kiểm cả vi/en, category thiếu slug không gọi products, search q rỗng không gọi search, response mapper/null và 404 đúng behavior đã chốt. Two concurrent SSR requests dùng QueryClient riêng; header/payload không mang cookie/token; timeout 5s/no server retry bằng controlled delay hoặc fake clock phù hợp.
- Lỗi query chính/ phụ, network/5xx/timeout: không serialize Error/session, không đổi thành not-found; browser vẫn có fallback/retry. Trạng thái failure test được điều khiển riêng cho browser/server, tránh assert một request khi browser policy có retry.
- Lỗi mới trong boundary bị chạm, thiếu artifact bắt buộc, giảm coverage scope hoặc import vi phạm chặn slice. Lỗi baseline ngoài scope ghi rõ và xử lý prerequisite/maintainer decision; không tự miễn required CI hay ghi skipped thành pass.
- Giữ trace/screenshot/video/HTTP count logs tại artifacts được quản lý, không commit runtime output vào source. PWA test có registration/controller/cache/offline evidence. Nếu không đủ môi trường để chạy, đánh dấu chưa kiểm và chưa đạt acceptance tương ứng.
- Rollback theo slice source/import/config/test cùng lượt; SSR rollback về client query đã có, PWA về cấu hình policy trước; không xóa test assertion để hợp thức regression. Không revert thay đổi local ngoài scope.

## Đầu vào

[Inventory](../17-storefront-migration-inventory/inventory.md), [Public boundary](../18-storefront-module-boundaries/boundaries.md), [Runtime](../19-storefront-runtime-boundaries/runtime.md), testing rules `.claude/rules/process/testing.md`, CI và config trong checkout hiện tại.
