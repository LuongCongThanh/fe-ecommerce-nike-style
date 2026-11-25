# Backlog chuyển cấu trúc Storefront — quyết định đã chốt

Ngày chốt 25/11/2026. Người dùng đã đồng ý chiến lược owner/consumer và catalog pilot trong vòng trước, đồng ý thứ tự migration và bốn đợt SSR trong vòng cuối. Chỉ quyết định chia delivery, không cấp quyền thực thi, branch/commit/push/PR hoặc đổi status delivery.

## Đầu vào đã chốt

- [Inventory](../17-storefront-migration-inventory/inventory.md) sở hữu snapshot source/consumer.
- [Public boundary](../18-storefront-module-boundaries/boundaries.md) sở hữu entry, helper owner, DAG và wishlist composition.
- [Runtime](../19-storefront-runtime-boundaries/runtime.md) sở hữu lifecycle, SDK/SSR isolation, cache/hydration và fallback.
- [Kiểm chứng](../20-storefront-verification-policy/verification.md) sở hữu baseline, quyền test, harness, gates và acceptance evidence.

Không sao chép các quyết định trên thành nguồn chuẩn khác. Mỗi delivery spec trỏ đúng owner và chỉ cụ thể hóa scope/consumer/gate cho lát cắt đó.

## Nguyên tắc handoff

- Backlog là kế hoạch đủ để viết spec; chưa tạo delivery identity hay coi tên đợt là folder blocker hợp lệ. Khi viết spec thật, tạo folder và wire blocked-by bằng identity thật ở pass sau; status bắt đầu todo.
- Mỗi slice có source owner, consumer phải đổi đồng lượt, test scope, config/docs owner, acceptance và rollback. Không liệt kê folder owner mà bỏ qua test mock string, generator, CI hoặc lint/coverage glob.
- `AGENTS.md`/policy files cần sửa cùng người trong phiên tương tác như quy tắc repo; không giao agent-run tự sửa stop files. Foundation phải đưa policy/config về trạng thái chạy được trước slice dựa vào chúng.
- Task delivery đang có giữ nguyên status/PR/identity. Specs breadcrumb/date/pagination/remove-config hiện có status review, status-badge i18n ready-for-agent, returns todo; index cũ có thể khác spec; không tự coi merged hoặc chạy lại. Slice chạm owner đó phải recheck diff/PR/checkout, xử lý việc đang dở trước khi đổi path; không blanket blocker done dựa trên index.

## Chiến lược đã được người dùng đồng ý ngày 24/11/2026

- Chuyển owner cùng consumer/import/test/config liên quan; không thêm compatibility re-export/path alias mặc định. Bridge là ngoại lệ phải có lý do cụ thể, file/symbol, owner và đợt xóa trước khi được duyệt; không giữ hai bản source cùng semantics.
- Thí điểm cả catalog (50 file ở snapshot) trong một đợt với direct consumers và wishlist slot; review mẫu trước khi mở rộng. Đây là điều chỉnh đã đồng ý so với lộ trình sơ bộ “một chức năng”. Không ghép SDK/SSR vào pilot.

## Backlog và thứ tự đã chốt

Các đợt dưới là tên kế hoạch, chưa là task identity. Thứ tự trình bày là thứ tự thực thi tuần tự trong checkout hiện tại; prerequisite bổ sung mô tả dependency có ý nghĩa. Mỗi đợt sau chỉ bắt đầu khi đợt trước đã được kiểm/review và việc đang dở đã xử lý theo tracker, không coi có report là merged.

### Nền kiểm chứng và baseline có thể tái lập

- **Prerequisite:** các quyết định Wayfinder đã resolve; recheck source và status task đang chạm. Ghi baseline trước chỉnh harness; ghi rõ failure do test/source drift.
- **Scope:** HTTP catalog fixture/harness trong test infrastructure mới; E2E catalog/search/PDP/checkout và fixture setup đang lệch; Playwright production config, scripts test harness nếu cần, CI job production/coverage theo verification policy. Giữ suite dev hiện có. Production job ban đầu chứng minh những boundary đã tồn tại (PWA/provider/catalog CSR); SSR assertions được bổ sung cùng SSR slice, không placeholder xanh.
- **Điểm dừng:** fixture đúng contract pin; browser và server HTTP probe truy cập được cùng harness; E2E phù hợp behavior hiện tại, PDP vẫn disabled; baseline/report phân biệt test pass với môi trường thiếu. Setup cart/checkout dùng fixture đúng scope, không thêm production bypass.
- **Test quyền sửa:** các spec E2E/fixture và test-infra liên quan có danh sách file ở delivery spec; allow-test-changes true. Không bỏ coverage của commerce đã hỗ trợ.
- **Gates/docs/rollback:** focused harness/E2E rồi root và browser/production gates theo verification; README hoặc test-infra docs ghi cách chạy. Rollback harness/config/tests/CI cùng lượt; không đổi source feature để sửa test.

### Rule và convention hỗ trợ migration có giới hạn

- **Prerequisite:** Nền kiểm chứng và baseline có thể tái lập.
- **Scope:** ESLint elements/zones/restricted imports, module DAG checker nếu config hiện có không đủ, lint fixture tests, coverage old→new manifest; AGENTS/convention/rule owner và mirror skill nếu thật sự bị sửa. Policy/stop files do người cùng sửa trong phiên tương tác trước khi runner dựa vào rule mới.
- **Điểm dừng:** path cũ/mới ánh xạ cùng logical owner; known existing violations được snapshot exact edge và đợt xóa (catalog↔wishlist chỉ tồn tại đến catalog pilot); allowed/wrong-symbol/private/cycle fixtures chứng minh cả pass/fail. Không bật blanket exemption cho modules/features/tests.
- **Test quyền sửa:** config/fixture tests cụ thể, không sửa behavior test feature. Gate root, focused lint fixture, build nếu config tác động bundle; docs architecture/convention phân biệt trạng thái chuyển tiếp.
- **Rollback:** rule/checker/manifest/docs trở lại cùng slice; không rollback source chưa chuyển.

### Shared components và cơ chế dùng chung

- **Prerequisite:** Rule và convention hỗ trợ migration có giới hạn.
- **Scope:** shared/ui (30 file snapshot) → shared/components; cơ chế generic routing/styles/feedback/queries/persistence/pagination/formatting/monitoring theo boundary đã chốt; tất cả direct source/test import và string mock liên quan (shared UI có 65 source consumer ở snapshot). Giữ provider/home/catalog-specific helpers chờ đúng owner slice.
- **Điểm dừng:** UI/accessibility/formatting/store persistence không đổi, coverage tập file tương đương. Tách cn/currency nhưng export utils khác chưa rõ consumer giữ exception có owner, không xóa ngầm; không biến file inactive thành public API mới.
- **Test/gates/docs:** colocated helper/UI tests và affected consumer tests; coverage + build + root, browser khi flow/layout bị chạm. Architecture tree và convention owner theo phần đã chuyển. Quyền test chỉ các import/mock/owner test được liệt kê.
- **Rollback:** source/import/coverage/rule cùng lượt, không giữ implementation ở cả path cũ và mới.

### Providers và layouts giữ lifecycle

- **Prerequisite:** Shared components và cơ chế dùng chung.
- **Scope:** app/_composition → providers cùng query-client factory/test; storefront-shell → layouts (components/hooks); root import/test, locale/offline/provider browser spec và consumer mới. Auth/cart/wishlist/catalog còn path cũ là entry cụ thể trong allowlist, cập nhật đến đợt owner đó được chuyển.
- **Điểm dừng:** root vẫn mount provider ngoài locale; query cache/lifecycle/cleanup và một notification owner giữ nguyên; guest merge vẫn thuộc layouts. Không chuyển auth store hoặc SDK chỉ để làm cây đẹp.
- **Test/gates/docs:** provider/layout/auth tests cần thiết, E2E provider/locale + full browser theo trigger, production PWA/runtime evidence; root/build. Owner docs runtime/architecture. Test quyền sửa scoped các import/mock và lifecycle test liên quan.
- **Rollback:** providers/layouts/root consumer/test/config cùng lượt.

### Catalog thí điểm nguyên owner và wishlist composition

- **Prerequisite:** Providers và layouts giữ lifecycle; active breadcrumb/pagination work được reconcile trước khi đổi path liên quan.
- **Scope:** toàn features/catalog → modules/catalog với naming schema/type theo ADR; shared mock-content → catalog; wishlist action slot/client composition dưới layouts/catalog; mọi route/home/layouts/wishlist direct consumer và test mock import liên quan. Không chuyển SDK, wishlist module hay home toàn bộ.
- **Điểm dừng:** không còn catalog→wishlist import; wishlist chỉ dùng public product rules; consumer showWishlist false không tự bật action. Giữ URL/filter/page/search/locale/404 hiện tại, disable PDP purchase, pin/mapping API cũ và loading/error states. Catalog old root hết consumer.
- **Test/gates/docs:** catalog behavior/URL/query/component tests, action interaction ở đúng composition owner, consumer wishlist/home tests, scoped browser rồi full E2E + root/build; docs public entry/rule theo paths thật. Không thêm suffix test. Review mẫu structure và scope đạt trước SDK/module tiếp.
- **Rollback:** catalog paths + direct imports/slot wiring/rule cùng lượt, giữ approved behavior; không để card vừa dùng slot vừa subscribe wishlist nội bộ.

### Integration Backend và generated contract chuyển đồng lượt

- **Prerequisite:** Catalog thí điểm nguyên owner và wishlist composition đã review đạt.
- **Scope:** lib/api (36 file), lib/schemas (12 file) → integrations/backend gồm client/endpoints/models/generated/env/adapters/testing/mocks/schemas; browser-bootstrap và User alias theo boundary. Mọi source/type/test/mock-string consumer, instrumentation, generator output/header, package formatter path, CI generated diff và lint overrides/ignore cùng lượt.
- **Điểm dừng:** không còn lib/api hoặc lib/schemas consumer/path tooling có hiệu lực; contract pin không đổi; generated nội dung không đổi ngoài header path nếu cần; MSW browser/Node và legacy server order reader giữ behavior. Không gắn client-only toàn SDK, không thêm SSR reader lúc rename.
- **Test/gates/docs:** SDK/schema/mapper/Node adapter + affected hooks/store tests; generator pin/diff, root/build/full E2E và production runtime smoke theo policy. Quyền test gồm import/mock path tới SDK và fixture helper; không rewrite assertions commerce. Docs api-integration/architecture/rules cập nhật đồng lượt.
- **Rollback:** SDK/import/instrumentation/generator/CI/lint/docs như một đơn vị; không revert pin ngoài scope.

### Auth và account theo public session boundary

- **Prerequisite:** Integration Backend và generated contract chuyển đồng lượt.
- **Scope:** features/auth/account → modules/auth/account, schema/service/store/types suffix; providers/layout/route consumers; extract auth/account layout UI triển khai vào owner/layouts nhưng framework guard entry vẫn mỏng.
- **Điểm dừng:** bootstrap-before/after ordering và auth memory/session reload giữ nguyên, User alias tích hợp không nhân đôi, không kéo cart/wishlist vào auth, không thêm account→orders vì URL. Recheck active task/resume ở owner trước chạy.
- **Test/gates/docs:** auth-store/session/roles, auth endpoint nếu caller thay, profile/address component tests; auth/account/browser vi/en + root/build/full E2E và runtime production smoke khi liên quan. Test scope đúng owner/consumers. Docs kiến trúc/entry.
- **Rollback:** owner paths và consumer/import/guard layout/test/rule cùng lượt; không sửa cookie/auth contract.

### Cart và wishlist giữ persistence và merge

- **Prerequisite:** Auth và account theo public session boundary.
- **Scope:** features/cart/wishlist → modules tương ứng; cart/wishlist store/hook/tests, checkout và layouts consumers, wishlist action composition path. Tách test consumer khỏi private store qua fixture/owner test entry đã quy định.
- **Điểm dừng:** storage schema/key, hydration, stock clamp, merge, undo/toast và public actions giữ nguyên; catalog không phụ thuộc wishlist trở lại. Không migrate API/cutover hay mở PDP.
- **Test/gates/docs:** hook/store/persisted list tests; wishlist/card composition consumers; browser cart/merge và checkout setup đã reconcile, root/build/full E2E; public entry/architecture docs.
- **Rollback:** owner/store/consumer/test/config cùng lượt, không xóa storage để che regression.

### Orders và checkout giữ workflow và route contract

- **Prerequisite:** Cart và wishlist giữ persistence và merge; date/status-badge/return work recheck, không tự đổi delivery status.
- **Scope:** features/orders/checkout → modules; suffix service/schema/type; orderKeys entry; checkout clearCart lấy public useCart; extract checkout page UI/form orchestration và success page UI vào owners ngoài app; route giữ dynamic/metadata/params nối mỏng.
- **Điểm dừng:** reservation/idempotency/request key/cache invalidation/redirect/orderId fallback/return lifecycle giữ nguyên; không làm order SSR có auth mới. Cart clear action không deep-import store; account/orders URL không đổi.
- **Test/gates/docs:** checkout flow/reservation/order-lifecycle/transitions/date/list/detail tests và relevant account/cart consumers; browser checkout/orders + root/build/full E2E. Test quyền sửa theo file scope; docs runtime/public entries thật.
- **Rollback:** workflow owner/route extract/direct consumer/test/rule cùng lượt, không sửa reservation/API semantics.

### Home và phần triển khai còn lại trong route

- **Prerequisite:** Orders và checkout giữ workflow và route contract.
- **Scope:** features/home → modules/home, useCanRender3D và types theo owner; home route; UI error/loading/offline/auth wrappers còn trong app đưa vào layouts/module thích hợp. Giữ Next special-file exports/basename, metadata/viewport/locale/static params/instrumentation tại nơi framework yêu cầu.
- **Điểm dừng:** không còn feature implementation cũ; app còn framework entry và phần nối mỏng, không nhét implementation vào barrel mới. Hero3D/fixture/newsletter và motion/visual giữ nguyên; chưa SSR catalog API trên home.
- **Test/gates/docs:** home/countdown/newsletter/3D helper, app/i18n tests; browser home/provider/offline/locale và root/build/full E2E/production PWA khi liên quan. Architecture tree và convention update.
- **Rollback:** home/route UI extraction/consumer/test/config cùng lượt; không di chuyển special export sai chỗ.

### Khóa migration và xóa ngoại lệ đã hết consumer

- **Prerequisite:** Home và phần triển khai còn lại trong route.
- **Scope:** audit path literal toàn repo (source/test/config/CI/scripts/skills/docs live); bỏ old-root rules và exact temporary edges đã hết consumer; cleanup bridge nếu được phê duyệt. Không sửa artifact task lịch sử để đổi identity hoặc xóa bằng chứng unique.
- **Điểm dừng:** không còn active import features/lib/api/lib/schemas/shared/ui/app/_composition; không private cross-module/cycle/barrel mới; coverage scope không mất file. Inactive helper exception giữ theo danh sách đã chốt, không tự xóa; utils bridge còn export unused phải được chứng minh consumer và cleanup trong slice, hoặc giữ named inactive exception không cấp API mới.
- **Test/gates/docs:** root + build + full E2E + coverage tương ứng và production runtime/PWA gate; canonical docs mô tả hiện trạng; negative lint fixtures vẫn fail đúng. Chưa có code SSR mới.
- **Rollback:** cleanup/rules/docs revert độc lập; không cần revert module migration đã ổn định. Chặn SSR nếu audit/gates còn thiếu.

### SSR public reader và danh sách sản phẩm thí điểm

- **Prerequisite:** Khóa migration và xóa ngoại lệ đã hết consumer; production harness/config CI ở Nền kiểm chứng đã có và được xác minh lại.
- **Scope:** integrations/backend/server public reader + mapper thuần được chia sẻ, modules/catalog/server query policy/prefetch, products route HydrationBoundary, categories/sizes/colors cho PLP; unit/HTTP/production SSR tests và CI assertions. Không dùng browser singleton/auth state, không thêm persistent cache/ISR.
- **Điểm dừng:** PLP public HTML có dữ liệu đúng URL/input, QueryClient theo request, không cookie/token, timeout/no-retry/fallback đúng runtime; browser root QueryClient/staleTime/retry giữ; fresh hydrated key không fetch ngay lại.
- **Test/gates/docs:** reader/mapper/query shape/normalization/abort/error/isolation tests và production HTTP HTML/browser fixtures vi/en; full E2E/root/build/coverage theo scope; production CI gate bắt buộc đạt. Docs api/runtime/architecture cập nhật phần SSR đã hoạt động, không tuyên bố toàn catalog SSR.
- **Rollback:** bỏ products prefetch/HydrationBoundary/reader wiring của slice để về client flow; giữ migration đã khóa.

### SSR category và search theo URL hiện có

- **Prerequisite:** SSR public reader và danh sách sản phẩm thí điểm đã review đạt.
- **Scope:** category/search routes và catalog server prefetch cho category resolution, products/search keys; production SSR cases vi/en, unknown slug, q rỗng, query/page/filter.
- **Điểm dừng:** tree-before-category products; slug thiếu không gọi products; search không trộn PLP filter; empty/404/network fallback theo runtime. Không đổi URL hoặc tự thêm notFound/redirect.
- **Test/gates/docs:** focused key/normalization test + HTTP count/HTML/browser production và root/build/full E2E; query phụ lỗi không hủy dữ liệu chính thành công. Docs cập nhật đúng hai route.
- **Rollback:** prefetch/hydration riêng category/search về client flow; giữ reader/products slice.

### SSR product detail và related products

- **Prerequisite:** SSR category và search theo URL hiện có theo thứ tự checkout tuần tự; reader/products là dependency kỹ thuật chính.
- **Scope:** PDP reader/prefetch/hydration và related products khi có category; tests detail mapper/null/404/related/error, browser variant interaction và disabled purchase.
- **Điểm dừng:** detail/related keys cùng client policy, dữ liệu raw model không nhân đôi; 404→null và UI not-found hiện tại, query phụ lỗi không làm PDP sai. Không tự mở mua hàng, thay variant selection/stock/API mapper.
- **Test/gates/docs:** unit/HTTP + raw HTML/production hydration/browser vi/en, root/build/full E2E/coverage theo scope; docs SSR PDP và giới hạn.
- **Rollback:** PDP/related SSR wiring về client flow, không revert các SSR route đã ổn định.

### SSR phần catalog trên home và bàn giao trạng thái cuối

- **Prerequisite:** SSR product detail và related products theo thứ tự tuần tự; catalog reader/keys/public entries có sẵn.
- **Scope:** home public API new arrivals/category tree prefetch qua catalog public server entry; tests và production CI evidence của cả phạm vi SSR. Không migrate fixture/hero3D/newsletter thành API hoặc đổi personalization.
- **Điểm dừng:** cùng key NEWEST và categories shape, không tạo cache client thứ hai; các route SSR đã chốt có evidence cả vi/en và fallback. Docs hiện trạng/chỉ mục/spec artifacts phản ánh những gì thật sự đã kiểm, không tự mark delivery done.
- **Test/gates/docs:** home/catalog affected tests, HTML/count/hydration production và root/build/full E2E/coverage theo scope, PWA regression khi runtime route bị ảnh hưởng. Test evidence có ở từng SSR slice, không để toàn bộ đến cuối.
- **Rollback:** home SSR wiring độc lập về client flow; giữ các route SSR khác. Bàn giao report/rủi ro/thao tác chưa chạy, không merge thay người.

## Điều kiện handoff chung của mọi đợt

- Delivery spec phải refresh file manifest từ checkout lúc tạo, ghi source owner và từng consumer/config/test ngoài owner; số file snapshot không phải quyền wildcard. Tests được chỉnh ghi allow-test-changes true và danh sách cụ thể; approved.files/commands vẫn theo người cấp, không tự mở khóa stop/secret files.
- Gate profile lấy từ verification owner: focused trước, root và build theo scope; coverage khi collected scope bị chạm; full E2E ba engine theo flow/routing/auth/storage/infrastructure; production Chromium cho SSR/PWA/runtime liên quan. Không đánh dấu pass nếu môi trường thiếu, không tăng retry/tắt gate cho refactor.
- Không có bridge mặc định. Nếu xuất hiện trường hợp không thể chuyển consumer cùng owner, dừng phần phụ thuộc và đưa ngoại lệ cụ thể vào phiên tương tác: old/new path, symbol, lý do, owner, consumer còn lại, đợt xóa và bằng chứng không có implementation kép. Cleanup cuối không nhận bridge vô thời hạn.
- Mỗi đợt migration cập nhật architecture/rules theo source thực tại bước đó; target design giữ vai trò thiết kế đích. Task/PR đang có phải reconcile trước owner slice tương ứng, không tự suy từ index hoặc memory.
- Một PR cho mỗi delivery spec nếu sau này được yêu cầu Git/PR; target dev và squash theo repo. Đây là cấu trúc bàn giao, không phải lệnh tạo PR, merge hay status ready-for-agent.

## Handoff đã chốt ngày 25/11/2026

- Mười một đợt chuẩn bị/migration đi tuần tự theo backlog trên, từ Nền kiểm chứng đến Khóa migration; catalog nguyên owner là checkpoint review trước khi mở rộng.
- Bốn đợt SSR chỉ bắt đầu sau khi khóa migration; products+reader → category/search → PDP+related → home API. Mỗi đợt có production evidence và rollback của chính nó.
- Không còn câu hỏi thiết kế đang mở trong ticket chia đợt. Việc lập file manifest theo checkout mới nhất, viết delivery spec với quyền file/lệnh và wire identity/blocker thật là bước handoff tiếp theo; không cần đoán lại kiến trúc.
- Nếu thực thi phát hiện consumer/boundary mới không thuộc các quyết định này, dừng phần phụ thuộc và ghi câu hỏi cụ thể để thảo luận; không coi rủi ro có thể phát sinh là ticket đang mở ngay bây giờ.

## Coupling đã đối chiếu để ước lượng slice

- Catalog: 50 file trong inventory hiện tại, nhiều component/query dùng chung giữa màn hình; số file không bao gồm các consumer ngoài catalog phải sửa import.
- SDK: lib/api 36 file, lib/schemas 12 file; 85 source file có tham chiếu lib/api, 25 có lib/schemas (có thể trùng). Atomic move cần cả generator output/header, package formatter path, CI diff path, lint generated ignore/restricted zones/mock override, instrumentation và test mock strings.
- Shared UI: 30 file, 65 source consumer; có thể thành mechanical slice riêng, đổi coverage glob trong cùng lượt.

Các số liệu chỉ giúp chọn seam, không phải giới hạn file quyền sửa; delivery spec phải refresh danh sách theo checkout lúc thực thi. Không mặc định các PR cũ đã merge.
