---
paths:
  - 'apps/**/*.tsx'
  - 'apps/**/use*.ts'
  - 'apps/**/use*.tsx'
  - 'packages/ui/**/*.tsx'
  - 'packages/shared/**/*.tsx'
  - 'packages/shared/**/use*.ts'
---

# Convention kiểm soát re-render React

Mục tiêu là giới hạn phạm vi cập nhật và loại bỏ render không cần thiết có chi phí đáng kể. Một lần render lại không mặc định là bug; không thêm memoization nếu chưa xác định nguồn cập nhật hoặc lợi ích.

## Thứ tự xử lý

1. Xác định state, query hoặc context nào thay đổi.
2. Đưa state xuống component nhỏ nhất thực sự cần nó.
3. Thu hẹp subscription/selector để component chỉ theo dõi dữ liệu sử dụng.
4. Tách subtree tĩnh hoặc đắt khỏi component cập nhật thường xuyên.
5. Ổn định object/function identity chỉ khi identity ảnh hưởng child memo, effect hoặc thư viện bên ngoài.
6. Dùng React DevTools Profiler để xác minh trước và sau đối với màn hình quan trọng.

## State và derived data

- Giữ local interaction state gần nơi sử dụng; không nâng state lên page/context nếu sibling không cần.
- Không lưu derived state bằng `useState` + `useEffect`. Tính trực tiếp trong render; chỉ `useMemo` khi phép tính thực sự đắt hoặc identity là contract.
- Không lưu cùng dữ liệu ở URL, query cache và Zustand. Chọn một source of truth theo convention data ownership.
- Dùng functional state update khi next state phụ thuộc previous state để tránh dependency và stale closure không cần thiết.
- Gộp state chỉ khi các field luôn thay đổi cùng nhau; tách state khi chúng có lifecycle hoặc tần suất cập nhật độc lập.
- Tránh effect gọi `setState` chỉ để phản chiếu props/query data; pattern này tạo thêm một render và có nguy cơ dữ liệu lệch.

## TanStack Query

- Component chỉ subscribe query data/status thực sự dùng; tách consumer nếu một phần UI thay đổi với tần suất khác.
- Dùng `select` để lấy/transform subset cần thiết thay vì để component map/filter lại ở nhiều nơi.
- Query key phải ổn định, serializable và không chứa function hoặc giá trị không thuộc input thực.
- Không copy query result vào local state hoặc Zustand. Form edit là ngoại lệ có chủ đích: snapshot dữ liệu ban đầu khi mở form và xác định rõ cách xử lý refetch.
- Giữ structural sharing mặc định; mapper/select không mutate response và nên giữ reference phần không thay đổi khi thực tế có thể.
- Không truyền toàn bộ query result xuống presentational component nếu view chỉ cần vài field và callback.

## Zustand và external store

- Subscribe bằng selector nhỏ nhất: `useStore((state) => state.cart.items)`, không gọi `useStore()` lấy toàn store.
- Không trả object/array mới từ selector ở mỗi lần gọi nếu không có equality phù hợp; chọn từng field hoặc dùng shallow equality khi cần nhiều field.
- Action của store phải có reference ổn định; không bọc lại action bằng arrow function trong selector nếu không cần.
- Store state phải immutable; chỉ tạo reference mới cho nhánh thực sự thay đổi.
- Với `useSyncExternalStore`, `getSnapshot` phải cached/stable khi dữ liệu không đổi và `subscribe` phải cleanup đúng.

## Context

- Không dùng một context lớn cho state có tần suất cập nhật khác nhau. Tách context theo lifecycle/responsibility hoặc dùng external store có selector.
- Memoize `value` của Provider khi Provider render thường xuyên và consumer phụ thuộc reference; callback trong value cũng phải ổn định hoặc được tách khỏi state.
- Đặt Provider ở phạm vi hẹp nhất nhưng không tạo lại nó theo navigation/render ngoài ý muốn.
- Không đưa server data thay đổi thường xuyên vào Context nếu TanStack Query đã quản lý subscription/cache.

## Props, callback và memoization

- Tránh tạo object, array hoặc React element mới chỉ để truyền vào child đã `memo`; chuyển constant tĩnh ra ngoài component hoặc memoize khi identity cần ổn định.
- Không dùng `useCallback` cho mọi handler. Chỉ dùng khi callback là dependency của effect/custom hook, truyền vào child đã memo hoặc thư viện yêu cầu identity ổn định.
- Không dùng `useMemo` cho phép tính rẻ, literal đơn giản hoặc để “làm code nhanh hơn” mà không có consumer identity.
- Dùng `React.memo` cho component thuần có render đáng kể, props thường không đổi và parent render thường xuyên. Không memo component nhỏ khi props luôn là object/function mới.
- Props nên nhỏ và primitive khi hợp lý; không truyền toàn bộ query/store/form object cho presentational component.
- Không viết custom comparator sâu cho `memo` trừ khi đo được comparator rẻ hơn render và contract props ổn định.

## Effect và vòng lặp render

- Dependency array phải đầy đủ; không tắt rule hooks để né render loop.
- Nếu effect loop, sửa source identity hoặc thiết kế state; không xóa dependency đúng.
- Object/function dùng làm dependency phải được tạo trong effect, chuyển ra ngoài component hoặc memoize theo dependency tối thiểu chính xác.
- Cleanup timer, subscription, event listener, observer và animation frame. Không đăng ký lại mỗi render do callback identity không ổn định.
- Effect chỉ đồng bộ với hệ thống bên ngoài. Logic phát sinh trực tiếp từ user action đặt trong event handler.

## List, table và form

- List dùng key theo ID ổn định; không dùng index hoặc key ngẫu nhiên. Key thay đổi sẽ remount, mất state và tăng render.
- Với list/table lớn, giữ column definition ổn định; paginate hoặc virtualize khi DOM/render cost đáng kể.
- Tách row/item thành component khi mỗi item có interaction/state riêng hoặc parent cập nhật thường xuyên; memoize sau khi xác minh props ổn định.
- React Hook Form ưu tiên subscription cấp field (`useWatch`, field state) thay vì watch toàn form trong component gốc.
- Không cập nhật state trên từng keystroke ở ancestor nếu chỉ input cần giá trị đó; debounce side effect, không debounce controlled input value.

## Không tối ưu sai

- React Strict Mode có thể render/effect hai lần trong development để phát hiện side effect; không coi đó là production re-render bug trước khi xác minh.
- Không cache dữ liệu sai hoặc bỏ dependency để giảm render.
- Không làm API component khó đọc hơn vì micro-optimization chưa đo được.
- Không thêm state singleton/mutable module để né React render.
- Performance fix phải ghi rõ nguyên nhân, phạm vi render được giảm và cách xác minh nếu thay đổi không hiển nhiên.

## Dấu hiệu cần flag khi review

- Component subscribe toàn store/context/query result nhưng chỉ dùng một field.
- `setState` trong effect để tạo derived state.
- Provider `value={{ ... }}` thay đổi mỗi render trong subtree lớn.
- Query data được copy sang Zustand/local state.
- Key list bằng index hoặc random value.
- `memo` đi cùng props object/function luôn mới.
- `useMemo`/`useCallback` hàng loạt không có consumer identity hoặc bằng chứng profiling.
- Parent quản lý state keystroke/hover cho subtree lớn không cần biết state đó.
