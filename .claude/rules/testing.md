---
paths:
  - 'apps/**/*.{ts,tsx}'
  - 'packages/**/*.{ts,tsx}'
  - '**/*.test.{ts,tsx}'
  - '**/*.spec.{ts,tsx}'
---

# Quy tắc kiểm thử

## Chọn đúng test layer

| Cần kiểm tra                                                                | Layer ưu tiên                    |
| --------------------------------------------------------------------------- | -------------------------------- |
| Pure function, mapper, formatter, business rule                             | Unit test Vitest                 |
| Zod schema và validation boundary                                           | Unit/table-driven test Vitest    |
| Hook/store với state transition                                             | Hook/integration test Vitest     |
| Component interaction, loading/error/empty/success                          | Testing Library integration test |
| API SDK endpoint, auth refresh, envelope/error mapping                      | Vitest + MSW server              |
| Routing, browser storage, hydration, service worker, nhiều feature nối tiếp | Playwright E2E                   |
| Critical customer journey xuyên nhiều route                                 | Playwright E2E                   |

- Đặt phần lớn logic ở unit/integration test vì nhanh và xác định; chỉ dùng E2E cho ranh giới browser và hành trình có giá trị cao.
- Không kiểm tra cùng một chi tiết ở mọi layer. Unit test bao phủ nhánh logic; E2E chứng minh các layer nối với nhau qua hành vi chính.
- Bug fix phải có regression test ở layer thấp nhất có thể tái hiện đúng lỗi. Thêm E2E khi lỗi chỉ xuất hiện qua tích hợp/browser.

## Tên và vị trí test

- Unit/integration test đặt gần source theo pattern workspace:
  - Storefront/package hiện dùng `src/**/__tests__/<subject>.test.ts(x)`.
  - Admin/CMS chấp nhận `src/**/*.{test,spec}.ts(x)`; ưu tiên `__tests__` cạnh feature để nhất quán với phần còn lại.
  - E2E chỉ đặt tại `apps/storefront/e2e/<flow>.spec.ts`.
- File test đặt theo subject/flow, không dùng `test1`, `misc`, `all-tests`.
- `describe` là unit/subject; `it`/`test` mô tả hành vi quan sát được và điều kiện: `rejects checkout when stock changed`, không dùng `works correctly`.
- Tên test không chứa implementation detail như tên state nội bộ hoặc private function trừ unit test trực tiếp function đó.

## Cấu trúc test

- Mỗi test theo Arrange–Act–Assert; ngăn block bằng dòng trống khi giúp đọc rõ, không bắt buộc comment `Arrange/Act/Assert`.
- Một test chứng minh một behavior/outcome chính. Có thể có nhiều assertion cùng chứng minh outcome đó.
- Dữ liệu test nhỏ, rõ intent và chỉ override field liên quan. Dùng fixture builder khi nhiều test cần valid baseline; không tạo object khổng lồ lặp lại.
- Ưu tiên table-driven test (`it.each`) cho validation, mapping và business matrix; case name phải hiển thị input/expected có ý nghĩa.
- Test phải deterministic: không phụ thuộc giờ hệ thống, locale máy, timezone, random, network thật hoặc thứ tự test. Fake/inject clock và seed dữ liệu khi cần.
- Không dùng snapshot lớn cho DOM/object. Snapshot chỉ cho output ổn định, khó assert rõ hơn và diff có giá trị review.

## Unit test TypeScript/Vitest

- Test public behavior; không export private helper chỉ để test. Nếu logic private quá phức tạp, extract pure domain function có trách nhiệm thật.
- Pure function phải bao phủ happy path, boundary value, invalid input và invariant quan trọng.
- Schema test phải kiểm tra valid payload, missing/nullable/optional khác nhau, boundary số và unknown value bị từ chối.
- State transition test phải bao phủ transition hợp lệ, transition bị cấm và state không đổi khi thất bại.
- Assertion cụ thể: ưu tiên `toEqual`, `toMatchObject`, `toHaveLength`, `rejects.toMatchObject`; không chỉ assert truthy khi shape/value quan trọng.
- Không kiểm tra lại implementation của thư viện bên thứ ba. Kiểm tra contract mà code project xây trên thư viện đó.
- Mock module chỉ tại boundary không kiểm soát được bằng input/adapter/MSW. Không mock chính subject đang test hoặc toàn bộ dependency graph.
- Dùng `vi.spyOn` có mục tiêu và restore sau test; không phụ thuộc call order trừ khi order là contract.
- Nếu test dùng fake timers, restore real timers trong cleanup và flush timer/Promise có chủ đích.
- Không dùng `test.only`, `describe.only`, `skip` hoặc `todo` khi hoàn tất task. CI đã cấm Playwright `only`; Vitest vẫn phải được review.

## Component và hook test

- Query ưu tiên theo người dùng:
  1. `getByRole`/`findByRole` với accessible name.
  2. `getByLabelText` cho form.
  3. Text/placeholder khi đó là contract người dùng thật.
  4. `data-testid` chỉ khi không có semantic query ổn định.
- Dùng `userEvent.setup()` và `await user.click/type/...`; chỉ dùng `fireEvent` cho primitive event không được `user-event` mô phỏng phù hợp.
- `getBy*` cho trạng thái sync hiện tại; `findBy*` cho phần tử sẽ xuất hiện async; `queryBy*` để assert không tồn tại.
- `waitFor` chỉ bọc assertion sẽ thay đổi; không đặt action hoặc nhiều side effect trong callback `waitFor`.
- Không assert class CSS/DOM nesting nếu không phải contract. Với trạng thái accessibility, assert role, name, disabled, checked, expanded hoặc alert.
- Kiểm tra đủ loading, empty, error, success cho component lấy dữ liệu; error state phải test retry khi có.
- Hook test phải render qua provider thật tối thiểu cần thiết; tái sử dụng helper như `renderWithProviders` và không tự dựng provider khác semantics.
- Mỗi test tạo QueryClient riêng, retry tắt và cache không rò giữa test.
- Reset Zustand/store/runtime singleton sau mỗi test; không dựa vào state do test trước để lại.
- Không test số lần render trừ khi performance regression cụ thể là contract; nếu cần, đo qua test harness nhỏ và tránh phụ thuộc Strict Mode dev behavior.

## API SDK và MSW

- API/transport test dùng MSW thay vì mock `fetch` thủ công để kiểm tra URL, method, request và response boundary thực tế.
- MSW server dùng `onUnhandledRequest: 'error'`; request ngoài expectation phải làm test fail.
- `beforeAll` listen, `afterEach` reset handler/state, `afterAll` close theo setup chung; không để handler override rò sang test khác.
- Fixture dùng chung phải valid theo schema và có ID ổn định. Test chỉ override field cần cho scenario.
- Endpoint test bao phủ:
  - Request method/path/query/body.
  - Response schema parse.
  - Non-2xx thành `ApiError` đúng `status`, `code`, `message`.
  - Auth refresh/retry và concurrency nếu endpoint liên quan.
  - Abort/network/invalid envelope khi behavior có ý nghĩa.
- Không gọi internet/backend thật trong unit/integration CI.
- Mock mode và real mode phải giữ cùng contract; test không được dựa vào chi tiết chỉ fixture mới có nếu UI production không được đảm bảo.

## E2E Playwright

### Phạm vi

- E2E dành cho critical journey: homepage/navigation, catalog/search, PDP variant, cart, auth, checkout, account/order và protected shell khi liên quan.
- Một spec đại diện một user flow/domain. Một test nên hoàn thành một outcome người dùng, không biến thành mega-flow kiểm tra toàn ứng dụng.
- Chỉ thêm E2E cho behavior có giá trị xuyên layer; validation thuần và mapper không thuộc E2E.

### Selector và assertion

- Ưu tiên `getByRole`, `getByLabel`, `getByText` với nội dung ổn định; dùng `getByTestId` chỉ khi semantic selector không thể ổn định.
- Không dùng CSS/XPath phụ thuộc DOM structure, Tailwind class hoặc `nth()` nếu item có tên/ID nghiệp vụ.
- Dùng web-first assertion `await expect(locator).toBeVisible()`; không đọc value rồi assert sync khi Playwright có assertion tự chờ.
- Chờ outcome người dùng hoặc URL/response cụ thể; không dùng `page.waitForTimeout`/sleep.
- Không dùng `networkidle` làm đồng bộ mặc định cho app có polling/service worker; chờ locator hoặc response thuộc flow.
- Locator phải unique. Nếu strict-mode locator fail, sửa accessible name/test contract thay vì dùng `.first()` để che ambiguity.

### Isolation và dữ liệu

- Mỗi test độc lập và chạy được riêng, ngẫu nhiên hoặc song song. Không phụ thuộc test trước tạo account/cart/order.
- Khởi tạo storage/session/data trong fixture hoặc bước setup rõ ràng; không chia sẻ mutable page/context giữa tests.
- Khi ghi `localStorage`, điều hướng/reload có chủ đích và dùng đúng version/schema key hiện hành.
- Dữ liệu/ID phải deterministic. Không dựa vào ngày hiện tại, inventory thay đổi hoặc thứ tự danh sách nếu flow không sở hữu chúng.
- Cleanup dữ liệu đã tạo nếu backend/mode test không tự reset. Cleanup phải chạy cả khi assertion fail khi có thể.
- Credential test lấy từ fixture/env an toàn; không hard-code secret production.

### Cross-browser, responsive và artifact

- Config hiện chạy Chromium, Firefox và WebKit; test mới không được chỉ pass nhờ API riêng Chromium.
- Critical responsive behavior kiểm tra tối thiểu viewport đại diện mobile và desktop khi change liên quan layout; visual manual baseline vẫn là 320/375/414/768/1440 px.
- Không cập nhật screenshot baseline mù quáng. Review diff hình ảnh và xác nhận thay đổi có chủ đích.
- Khi flaky/fail, dùng trace, screenshot và video config hiện có trước khi tăng timeout/retry.
- Không tăng global timeout hoặc retry để che race condition; sửa synchronization, isolation hoặc product behavior.
- Không commit `playwright-report`, `test-results`, trace, video hoặc screenshot failure ngoài baseline được quản lý.

### Page object và helper

- Chỉ tạo page object/fixture khi selector và hành vi dùng lại ở nhiều spec. Với flow đơn giản, locator trực tiếp dễ đọc hơn abstraction.
- Page object biểu diễn capability người dùng (`loginAsCustomer`, `addProductToCart`), không chỉ wrap từng `click`/`fill` 1:1.
- Assertion thuộc spec khi là outcome nghiệp vụ; helper có thể assert invariant setup nhưng không che outcome chính.
- Helper không chứa sleep, retry tùy ý hoặc catch bỏ qua failure.

## Chống flaky test

- Không sleep cố định, random không seed, network thật, shared mutable state hoặc assertion phụ thuộc thứ tự.
- Không tăng timeout trước khi xác định nguyên nhân.
- Không catch assertion để test tiếp tục hoặc retry thủ công toàn flow.
- Animation ảnh hưởng interaction phải được chờ theo trạng thái DOM hoặc tắt bằng test setting phù hợp, không đoán duration.
- Nếu test flaky chưa thể sửa trong scope, báo test, tần suất/triệu chứng và artifact; không `skip` âm thầm.

## Coverage

- Coverage là tín hiệu, không phải mục tiêu thay thế chất lượng assertion.
- Không viết test vô nghĩa chỉ để tăng phần trăm hoặc exclude file mới để qua threshold.
- Ưu tiên branch coverage cho business rule, validation, error mapping và permission/transition.
- Storefront có threshold cấu hình cao cho vùng được collect; thay đổi các vùng đó phải giữ threshold bằng test hành vi có giá trị.

## Checklist test cho thay đổi

- Có test cho happy path và failure/boundary quan trọng.
- Test ở layer thấp nhất đủ chứng minh behavior; E2E chỉ cho integration/browser journey.
- Test độc lập, deterministic và không rò mock/cache/store/storage.
- Selector theo semantic/accessibility, không theo implementation detail.
- Không có sleep, `.only`, skip mới, snapshot lớn hoặc network thật.
- Error, loading, empty, success và retry được test khi component có các state đó.
- Tất cả consumer được test lại khi extract shared code.
- Tên test mô tả behavior và failure output đủ giúp chẩn đoán.

## Phạm vi chạy

- Chạy test file bị ảnh hưởng trực tiếp trước:

```bash
pnpm --filter <workspace> exec vitest run <path/to/test>
pnpm --filter storefront exec playwright test <path/to/spec> --project=chromium
```

- Sau focused test, chạy lint, typecheck và test của workspace đó.
- Chạy `pnpm lint`, `pnpm format:check`, `pnpm typecheck` và `pnpm test` ở root trước khi tuyên bố hoàn tất thay đổi xuyên workspace.
- Chạy `pnpm build` khi thay đổi framework, routing, cấu hình, dependency hoặc production bundle.
- Chạy đầy đủ `pnpm test:e2e` khi browser flow quan trọng, routing, auth, storage hoặc E2E infrastructure thay đổi.
- Báo rõ kiểm tra nào đã bỏ qua và lý do cụ thể; không mô tả một kiểm tra chưa chạy là đã pass.
