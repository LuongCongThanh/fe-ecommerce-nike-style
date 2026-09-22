---
paths:
  - 'apps/**/*.{ts,tsx,mts,cts}'
  - 'packages/**/*.{ts,tsx,mts,cts}'
---

# Convention TypeScript strict

`tsconfig`, ESLint và Prettier là nguồn enforce tự động. Rule này bổ sung các quyết định thiết kế type mà công cụ không thể suy ra đầy đủ. Không vô hiệu hóa strictness để làm code compile.

## Cấu hình nền bắt buộc

- Giữ `strict`, `noImplicitAny`, `verbatimModuleSyntax`, `noEmit` và module resolution hiện có.
- Không hạ mức strict ở app/package con hoặc thêm `skip`/`exclude` chỉ để che lỗi source.
- File mới dùng TypeScript; không thêm JavaScript vào source runtime khi package đang `allowJs: false`.
- Không sửa generated declaration hoặc generated route để chữa type error; sửa source/generator owner.

## `any`, `unknown` và type assertion

- Không dùng explicit/implicit `any`. Boundary chưa biết kiểu dùng `unknown`, sau đó parse/narrow trước khi truy cập.
- Không dùng `as any`, `as unknown as T` hoặc assertion dây chuyền để ép hai type không tương thích.
- `as T` chỉ được dùng khi runtime invariant đã được chứng minh nhưng compiler không biểu diễn được; đặt assertion sát boundary và comment tiếng Việt nếu lý do không hiển nhiên.
- Không dùng non-null assertion `value!` cho dữ liệu API, DOM query, env hoặc lookup. Guard/parse trước hoặc biểu diễn `null` trong type.
- `satisfies` được ưu tiên khi cần kiểm tra shape mà vẫn giữ literal inference; không dùng assertion làm mất kiểm tra excess property.
- Không dùng `// @ts-ignore`. `// @ts-expect-error` chỉ dùng cho type test hoặc workaround có lý do, issue/điều kiện gỡ và phải nằm ngay trên dòng dự kiến lỗi.
- Không tắt ESLint rule ở cấp file. Disable một dòng chỉ khi không có thiết kế type an toàn hơn và phải giải thích lý do.

```ts
// Tránh
const payload = response as ProductResponse;

// Ưu tiên
const payload = ProductResponseSchema.parse(response);
```

## Inference và annotation

- Để TypeScript suy ra type cho biến local và return đơn giản; không lặp type hiển nhiên.
- Khai báo return type cho exported function, public hook/component API phức tạp, recursive function và boundary nơi inference drift có thể làm đổi API.
- Callback nhỏ có contextual typing không cần annotation thủ công.
- Không annotate giá trị bằng type rộng làm mất literal (`const status: string = 'pending'`). Dùng inference, `as const` hoặc `satisfies`.
- Type public phải đặt tên theo domain; tránh anonymous object type lặp lại ở nhiều public signature.

## `interface` và `type`

- Dùng `interface` cho object contract có thể được implement/extend: props, options, adapter contract, public object model.
- Dùng `type` cho union, intersection, tuple, mapped/conditional type, function type và type suy ra.
- Không prefix `I`/`T`; dùng `Product`, `ProductCardProps`, `RequestOptions`.
- Không tạo interface rỗng chỉ extend type khác; dùng type alias hoặc type gốc trực tiếp.
- Tránh intersection của object có field trùng semantics. Thiết kế contract rõ thay vì để intersection tạo `never`.
- Public props/options ưu tiên `readonly`; collection đầu vào không mutate dùng `readonly T[]` hoặc `ReadonlyArray<T>`.

## Union và trạng thái

- Không dùng `enum`; dùng string literal union hoặc `as const` object/array.
- Workflow/state có case hữu hạn dùng discriminated union với một discriminator ổn định (`status`, `kind`, `type`).
- Không biểu diễn mutually exclusive state bằng nhiều boolean độc lập.
- `switch` trên union phải exhaustive. Case mới phải gây compile error tại owner thay vì rơi vào `default` im lặng.
- `default` chỉ dùng khi input thật sự mở; không dùng để che union thiếu case.

```ts
type QueryViewState<T> = { status: 'loading' } | { status: 'error'; message: string } | { status: 'empty' } | { status: 'success'; data: T };
```

## Nullability và optional

- Phân biệt rõ:
  - `undefined`: chưa cung cấp/không tồn tại trong shape.
  - `null`: contract chủ động biểu diễn không có giá trị.
  - Chuỗi rỗng: input có mặt nhưng chưa có nội dung.
- Không dùng optional (`?`) khi field luôn tồn tại nhưng có thể `null`.
- Không dùng `foo || fallback` nếu `0`, `false` hoặc chuỗi rỗng là giá trị hợp lệ; dùng `foo ?? fallback`.
- Lookup/index access phải xử lý khả năng không tìm thấy. Không assertion chỉ vì “dữ liệu chắc chắn có”.
- Optional chaining không thay cho validation; nếu thiếu field là lỗi contract, parse/fail tại boundary.
- Default value đặt tại owner của semantics: schema, function boundary hoặc component prop; không rải fallback khác nhau khắp consumer.

## Type narrowing

- Narrow bằng `typeof`, `instanceof`, `in`, equality, discriminant, Zod hoặc type guard có kiểm chứng runtime.
- Type guard phải kiểm tra đủ invariant để kết luận type; không viết predicate chỉ return `true` hoặc check một field yếu.
- Ưu tiên control-flow narrowing bằng guard clause thay vì assertion sau chuỗi điều kiện phức tạp.
- Error trong `catch` là `unknown`; narrow trước khi lấy `message`, `code`, `status`.
- Dữ liệu từ `JSON.parse`, storage, postMessage, URL payload và network luôn được xem là `unknown` tại boundary.

## Object và collection

- Không mutate props, query data, store snapshot hoặc function input.
- Dùng object/array spread, `map`, `filter` hoặc Immer/store action phù hợp để tạo thay đổi immutable.
- Không dùng `Object`, `Function`, `{}` hoặc lowercase wrapper type (`string` đúng, `String` sai).
- Dictionary dùng `Record<Key, Value>` khi key set/semantics rõ; dùng `Map` khi cần key không phải string, thứ tự hoặc thao tác map thực sự.
- Tuple chỉ dùng khi vị trí có semantics rõ và số phần tử cố định; nếu call site khó đọc, dùng object có tên field.
- Không dùng sparse array hoặc delete phần tử bằng `delete`; dùng `filter`/`splice` trên bản copy theo ownership.
- Sort dữ liệu không thuộc sở hữu bằng `toSorted()` hoặc copy trước `sort()` để tránh mutate cache/props.

## Function và callback

- Public function có input/output domain rõ; tránh `(...args: any[]) => any`.
- Callback return `void` nghĩa caller bỏ qua return, không có nghĩa implementation chắc chắn không trả value; không dựa vào return ẩn này cho control flow.
- Event handler sync không trả Promise trực tiếp cho prop yêu cầu `void` nếu rejection có thể bị bỏ quên; wrap và xử lý lỗi có chủ đích.
- Optional callback gọi bằng `callback?.(...)`; không dùng non-null assertion.
- Overload chỉ dùng khi input/output có quan hệ mà union/generic không biểu diễn rõ hơn. Implementation signature không phải public contract.
- Không dùng default generic `any`; dùng `unknown`, constraint hoặc không đặt default.

## Generic

- Generic phải thể hiện quan hệ giữa từ hai vị trí type hoặc giữ thông tin input-output. Nếu chỉ xuất hiện một lần, dùng type cụ thể/`unknown`.
- Tên generic ngắn (`T`, `K`, `V`) chỉ cho scope nhỏ quen thuộc; public abstraction phức tạp dùng tên rõ (`TData`, `TVariables`, `TResponse`).
- Constraint phải là nhỏ nhất đủ dùng (`T extends { id: string }`), không ép consumer phụ thuộc model lớn.
- Không tạo conditional/mapped type phức tạp khi explicit domain type dễ đọc và báo lỗi tốt hơn.
- Không dùng generic để che các domain khác semantics trong một API chung.

## Async và Promise

- Không tạo Promise bằng constructor quanh API đã trả Promise.
- Luôn `await`/return/handle Promise; không để floating Promise. Dùng `void` chỉ cho fire-and-forget có error path riêng và comment nếu không hiển nhiên.
- Chạy song song bằng `Promise.all` khi các operation độc lập; chạy tuần tự khi có dependency, rate limit hoặc transaction ordering.
- Không `await` bên trong loop nếu operation độc lập mà số lượng được kiểm soát; cũng không parallel không giới hạn với collection lớn.
- Abort/cancel request hoặc effect dài khi lifecycle yêu cầu; không cập nhật state sau owner đã unmount nếu API không tự quản lý.
- Không retry mutation không idempotent nếu chưa có idempotency contract.

## Error và `Result`

- Throw `Error`/`ApiError`, không throw string, number hoặc object tùy ý.
- Expected validation/domain outcome có thể dùng discriminated result; unexpected failure dùng exception/error boundary phù hợp.
- Không trộn `null`, `false` và exception làm ba cách báo cùng một loại failure.
- Khi wrap lỗi, giữ cause nếu runtime hỗ trợ và không làm lộ dữ liệu nhạy cảm.
- Public function phải có failure semantics nhất quán giữa implementation thật và mock/adapter.

## React TypeScript

- Props đặt tên `<Component>Props`, field `readonly`; không dùng `React.FC` chỉ để có `children` ngầm.
- `children` khai báo rõ bằng `React.ReactNode` khi component thực sự nhận children.
- Event dùng type cụ thể (`FormEvent<HTMLFormElement>`, `ChangeEvent<HTMLInputElement>`), không dùng `any` hoặc event DOM chung.
- Ref dùng element type chính xác; không cast ref giữa các element không tương thích.
- State có nhiều phase dùng discriminated union; không khởi tạo `{}` rồi cast sang model hoàn chỉnh.
- `useState` cần generic khi initial value `null`, array rỗng hoặc literal quá hẹp; còn lại ưu tiên inference.
- Context default dùng `null` và custom hook guard ngoài Provider; không tạo object giả để tránh null check.
- Component polymorphic/asChild phải giữ type, ref và semantics của element; không cast props tùy tiện.

## Zod và type nguồn sự thật

- Transport type suy ra từ Zod bằng `z.infer`; không viết interface song song có cùng shape.
- Schema là runtime source of truth cho network/storage input. TypeScript type không thay thế validation runtime.
- Form schema có thể khác transport schema nếu UX/nullability khác; mapper chịu trách nhiệm chuyển đổi rõ ràng.
- Không dùng `.passthrough()` hoặc `z.unknown()` rộng nếu contract có thể mô tả chính xác hơn.
- Validate env một lần trong module config; consumer dùng config đã typed, không đọc `process.env` rải rác.

## Export và module boundary

- Ưu tiên named export; default export chỉ khi framework/file convention yêu cầu.
- Export type bằng `export type`; import type bằng `import type` để giữ runtime graph sạch.
- Không re-export private implementation hoặc tạo barrel mới.
- Public package API chỉ qua explicit `package.json#exports`; consumer không import source path.
- Thay đổi public type phải kiểm tra toàn bộ consumer và được xem như contract change.

## Pattern bị cấm

```ts
let value: any;
const product = payload as Product;
const id = product!.id;
const result = data as unknown as Result;
// @ts-ignore
enum OrderStatus {}
function run(enabled: boolean, silent: boolean) {}
throw 'failed';
```

Ngoại lệ từ dependency thiếu type phải được cô lập trong adapter/declaration nhỏ nhất, có comment lý do và không làm `any` lan sang domain code.

## Checklist trước khi hoàn tất

- Không có `any`, double assertion, non-null assertion hoặc ignore directive mới không được giải thích.
- Mọi `unknown` được parse/narrow trước khi dùng.
- Nullability và optional phản ánh đúng contract.
- Union hữu hạn được xử lý exhaustive và không tạo invalid state bằng boolean rời rạc.
- Input không bị mutate; async operation được await/return/handle.
- Public function/component/hook có type rõ, nhỏ và không lộ implementation private.
- Transport type đến từ schema; không có type song song bị drift.
- `pnpm --filter <workspace> typecheck` và ESLint pass mà không hạ strictness.
