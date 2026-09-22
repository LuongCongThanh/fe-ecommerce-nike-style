---
paths:
  - 'apps/**/*.{ts,tsx}'
  - 'packages/**/*.{ts,tsx}'
---

# Clean Code và SOLID trong React/TypeScript

SOLID là công cụ ra quyết định, không phải lý do tạo thêm layer. Ưu tiên code đơn giản, local và test được; chỉ trừu tượng hóa khi có nhiều trách nhiệm hoặc consumer thực tế.

## Thứ tự ưu tiên

Khi các nguyên tắc cạnh tranh, ưu tiên theo thứ tự:

1. Đúng business rule và an toàn dữ liệu.
2. Code dễ đọc tại call site.
3. Dependency direction và khả năng test.
4. Cohesion cao, coupling thấp.
5. Loại bỏ duplication cùng semantics.
6. Tối ưu hiệu năng đã được đo.

Không hy sinh tính đúng đắn hoặc API rõ ràng chỉ để giảm số dòng, đạt DRY tuyệt đối hay áp dụng một design pattern.

## Hàm sạch

- Một hàm thực hiện một hành động ở một mức abstraction. Nếu tên hàm cần chứa “and”, xem xét tách trách nhiệm.
- Tên hàm phải mô tả intent/domain outcome (`calculateOrderTotal`, `canApproveReturn`), không mô tả cơ chế chung chung (`processData`, `handleStuff`).
- Ưu tiên 0–2 tham số. Từ 3 tham số liên quan trở lên, dùng options object có type và tên field rõ ràng; không tạo options object cho hai primitive đơn giản chỉ để đạt quy tắc hình thức.
- Không dùng boolean positional argument như `createOrder(data, true, false)`. Dùng options có tên, union mode hoặc tách hàm theo intent.
- Không trộn command và query: hàm hoặc thay đổi state/side effect, hoặc trả dữ liệu. Nếu cần cả hai, tên và contract phải làm side effect hiển nhiên.
- Guard clause cho invalid/terminal case trước; tránh nesting sâu và `else` sau `return`.
- Không mutate input. Trả object/array mới hoặc gọi action/store API chịu trách nhiệm mutation.
- Không phụ thuộc thời gian, random, browser global hoặc mutable singleton ẩn trong pure business function; truyền dependency/value vào khi cần test deterministic.
- Async function phải trả Promise có type rõ ở public boundary; không dùng `void` để che Promise trừ event handler cố ý và lỗi đã được xử lý.
- Không bắt exception chỉ để throw lại cùng lỗi. Chỉ catch khi có thể recover, thêm context hữu ích, translate boundary hoặc cleanup.

Ví dụ:

```ts
// Tránh: boolean mơ hồ, nhiều trách nhiệm.
updateOrder(order, true, false);

// Ưu tiên: intent rõ tại call site.
approveOrderReturn({ orderId, notifyCustomer: true });
```

## Luồng điều khiển

- Ưu tiên happy path tuyến tính và guard clause; hạn chế nesting quá ba cấp.
- Điều kiện phức tạp hoặc lặp lại phải được đặt tên theo domain (`canCheckout`, `isReturnWindowOpen`).
- Không dùng double negative (`!isNotAllowed`); đặt boolean dương và rõ nghĩa.
- Dùng exhaustive `switch` cho discriminated union/state hữu hạn; gọi helper `assertNever` hoặc pattern tương đương để compiler bắt case mới.
- Không dùng magic string/number cho domain state, route, query key hoặc giới hạn có ý nghĩa; đặt constant gần owner hoặc schema.
- Không dùng ternary lồng nhau. Chuyển sang guard clause, mapping hoặc component/hàm có tên.
- Không dựa vào truthy/falsy khi `0`, chuỗi rỗng, `null` và `undefined` có semantics khác nhau; so sánh rõ theo contract.

## Module và file

- File có một owner/trách nhiệm chính; export chính phải khớp tên file khi có thể.
- Public API nhỏ nhất có thể. Không export helper chỉ để test; test hành vi qua API public hoặc extract pure module có ý nghĩa thật.
- Constant, type và helper chỉ dùng một file giữ private trong file đó.
- Không tạo catch-all `utils.ts`, `helpers.ts`, `services.ts`, `constants.ts` ở scope rộng. Tên module theo capability/domain cụ thể.
- Tách file khi code có lý do thay đổi độc lập, cần boundary test/reuse hoặc làm public API rõ hơn; không tách mỗi hàm thành một file.
- Xóa dead code, import/export không dùng, feature flag hết hạn và comment mô tả implementation cũ. Git là nơi lưu lịch sử.

## Dữ liệu và model

- Parse dữ liệu `unknown` tại boundary bằng Zod/type guard; bên trong domain dùng type đã validate.
- Không dùng một type cho transport DTO, editable form và view model nếu semantics/nullability khác nhau; đặt type riêng và mapper rõ ràng.
- Tránh primitive obsession cho giá trị có invariant quan trọng; schema hoặc constructor/factory thuần phải enforce invariant tại boundary.
- Derived value tính từ source of truth, không lưu đồng thời ở nhiều store/state.
- Collection operation ưu tiên `map`, `filter`, `find`, `some`, `every` khi thể hiện intent rõ; dùng loop khi cần early exit hoặc hiệu năng và vẫn dễ đọc hơn.

## Comment và tài liệu trong code

- Comment mới viết tiếng Việt và giải thích “vì sao”, invariant, workaround, security constraint hoặc business exception.
- Không comment diễn giải từng dòng, không giữ code bị comment-out và không dùng TODO không có owner/context.
- TODO phải nêu điều kiện gỡ hoặc issue nếu có: `TODO(#123): bỏ adapter sau khi API v2 được rollout`.
- Public contract phức tạp dùng JSDoc ngắn về semantics, failure và invariant; không lặp lại type signature.
- Workaround phải trỏ tới nguyên nhân upstream/config liên quan và được cô lập trong module nhỏ nhất.

## Side effect và dependency

- Side effect nằm ở boundary dễ nhận biết: event handler, effect, mutation hook, adapter hoặc endpoint.
- Pure logic tách khỏi side effect để test không cần render/network khi hợp lý.
- Không đọc env trực tiếp rải rác; đi qua module config đã validate.
- Không khởi tạo client/store/provider trong feature render. Lifecycle owner chịu trách nhiệm tạo và cleanup dependency.
- Dependency được truyền qua props/hook/provider/adapter khi cần thay implementation; không dùng service locator hoặc global mutable object ẩn.

## Khả năng test

- Code khó test thường báo hiệu responsibility hoặc dependency boundary sai; sửa thiết kế trước khi mock sâu.
- Không thêm production branch chỉ phục vụ test.
- Pure business rule phải test table-driven cho boundary case quan trọng.
- Component test theo output và user behavior; không assert state/hook implementation private.
- Adapter test contract chung để bảo đảm mock/browser/server implementation có cùng semantics khi có nhiều implementation.

## S — Single Responsibility

- Route/page: đọc params và compose feature.
- Presentational component: render và phát user intent; không biết transport, query key hoặc cache invalidation.
- Container/controller hook: đổi query/mutation/URL state thành render model và callback có ý nghĩa với view.
- Query/mutation hook: sở hữu server-state lifecycle; không trả JSX hoặc chứa layout.
- Endpoint function: mô tả một request/response.
- Schema: validate một contract.
- Tách file khi có nhiều lý do độc lập để thay đổi, không dựa riêng vào số dòng.

Không làm:

- Component vừa fetch, normalize, quản lý form, quyết định permission và render toàn trang.
- `utils.ts`, `helpers.ts`, `services.ts` trở thành nơi chứa mọi logic không biết đặt đâu.

## O — Open/Closed

- Mở rộng UI primitive bằng props/variant/composition; không thêm chuỗi `if` theo từng consumer vào shared component.
- Dùng mapping có type cho status -> label/variant/allowed action khi tập giá trị đóng và compiler có thể kiểm tra exhaustiveness.
- Dùng discriminated union và exhaustive switch cho state machine/domain transition.
- Không xây plugin/registry abstraction khi mới có một consumer hoặc một variation.

## L — Liskov Substitution

- Component wrapper phải giữ contract quan trọng của primitive: ref, disabled, keyboard behavior, ARIA và event semantics.
- Prop tên giống nhau phải có cùng ý nghĩa. Không để `onSubmit` đôi khi chỉ validate nhưng đôi khi tự điều hướng âm thầm.
- Implementation của adapter phải trả cùng shape/error semantics ở mock, browser và server runtime.
- Không nới input nhưng thu hẹp output trái với public type; schema và runtime phải khớp type công bố.

## I — Interface Segregation

- Props chỉ chứa dữ liệu/callback component thực sự dùng; không truyền cả store/query result nếu chỉ cần vài field.
- Tách read model khỏi mutation command khi consumer không cần cả hai.
- Public subpath export bề mặt nhỏ; không export implementation nội bộ “cho tiện”.
- Tránh context chứa mọi state của app; chia theo lifecycle và tần suất cập nhật nếu consumer khác nhau.

## D — Dependency Inversion

- Feature phụ thuộc public contract (`@repo/api-sdk`, `@repo/schemas`, props/callback), không phụ thuộc MSW fixture hoặc fetch implementation.
- Runtime-specific behavior đi qua adapter/provider hiện có; không kiểm tra environment rải rác trong component.
- Inject dependency ở boundary khi cần test/đa runtime. Không tạo interface + factory chỉ để bọc một hàm thuần ổn định.
- Package cấp thấp không import app cấp cao; dependency luôn hướng về contract ổn định.

## Pattern ưu tiên

- Composition thay inheritance.
- Container/hook điều phối dữ liệu + presentational component khi việc tách giúp test/reuse rõ ràng.
- Query-key factory cho domain có list/detail/filter.
- Adapter cho khác biệt browser/server/mock.
- Schema-first boundary cho dữ liệu `unknown`.
- State machine/discriminated union cho workflow có transition hữu hạn.
- Compound component/CVA cho UI primitive có variant, chỉ khi API đơn giản hơn nhiều boolean prop.

## Pattern cần tránh

- Repository/service layer chỉ chuyển tiếp 1:1 sang `@repo/api-sdk` mà không thêm boundary có giá trị.
- Generic base component/hook với nhiều type parameter chỉ để hai đoạn code trông giống nhau.
- Prop boolean chồng chéo tạo trạng thái vô hiệu (`isLoading`, `isError`, `isEmpty`, `hasData` cùng tự quản lý); dùng union hoặc state nguồn.
- Singleton mutable ngoài store/runtime được quản lý.
- Premature memoization (`useMemo`, `useCallback`, `memo`) khi chưa có consumer identity hoặc bằng chứng performance.
- Catch-all context, god hook, god component và circular dependency.
- Hàm nhiều boolean flag, object parameter kiểu “bag of anything” và type có quá nhiều field optional tạo trạng thái vô hiệu.
- `as unknown as`, non-null assertion hàng loạt hoặc `eslint-disable` dùng để vượt qua design/type issue.
- “Manager”, “Processor”, “Handler”, “Service” không nói rõ capability/domain.
- Refactor trộn với thay đổi behavior lớn mà không có test bảo vệ hành vi cũ.

## Ngưỡng trừu tượng hóa

Chỉ trích xuất shared abstraction khi thỏa ít nhất một điều:

1. Có từ hai consumer thực tế với cùng semantics, không chỉ giống cú pháp.
2. Boundary cần được enforce tập trung: auth, transport, validation, accessibility hoặc design token.
3. Logic thuần đủ phức tạp và cần test độc lập.

Nếu hai consumer có lý do thay đổi khác nhau, giữ duplication nhỏ thay vì ép chung abstraction sai.

## Code smell buộc phải xem lại

- Component/hook có nhiều nguồn state và side effect không liên quan.
- Hàm nhận quá nhiều tham số hoặc trả object với phần lớn field không phải consumer nào cũng dùng.
- Cùng một business condition được viết ở nhiều nơi.
- Một thay đổi nhỏ buộc sửa nhiều module không liên quan.
- Module cấp thấp biết route, toast, translation hoặc component cấp cao.
- Test cần mock chuỗi dài nhiều module private.
- Tên biến/hàm không thể đặt rõ nếu không dùng từ chung chung như `data`, `process`, `manager`.
- Thêm case mới đòi sửa chuỗi `if` rải rác thay vì một union/mapping owner.
- Abstraction chung có nhiều flag/callback chỉ để mô phỏng lại behavior riêng của từng consumer.

Khi gặp code smell trong phạm vi đang sửa: refactor phần liên quan nếu có test hoặc có thể bảo vệ hành vi an toàn. Nếu refactor vượt scope/rủi ro, báo rõ technical debt cụ thể; không âm thầm mở rộng thay đổi.

## Checklist Clean Code trước khi hoàn tất

- Mỗi module/hàm/component có một trách nhiệm và owner rõ.
- Tên thể hiện domain intent tại call site.
- Không có duplicate cùng semantics trong phạm vi đã tìm kiếm.
- Không có side effect ẩn, mutation input hoặc source of truth thứ hai.
- Dependency hướng về contract ổn định, không import ngược layer.
- Error và invalid state được biểu diễn rõ, không che bằng assertion.
- Abstraction mới có consumer/boundary thật và API nhỏ hơn tổng độ phức tạp nó thay thế.
- Test xác nhận behavior và failure path, không khóa implementation detail.
