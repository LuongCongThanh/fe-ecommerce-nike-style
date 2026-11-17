# Plan 02: Định dạng ngày đơn hàng theo locale

Branch: `feat/02-order-date-locale` (từ `dev`). Một PR, không có breaking change (chỉ đổi cách hiển thị `created_at`).

## Phạm vi

Tạo:

- `src/features/orders/formatOrderDate.ts`: hàm thuần `formatOrderDate(iso: string, locale: string, options?: { withTime?: boolean; timeZone?: string }): string`.
- `src/features/orders/formatOrderDate.test.ts`: unit test Vitest.

Sửa:

- `src/features/orders/order-list/components/OrdersClient.tsx` dòng 52: `new Date(order.created_at).toLocaleDateString('vi-VN')` -> `formatOrderDate(order.created_at, locale)`. `locale` đã có từ `useLocale()` (dòng 19).
- `src/features/orders/order-detail/components/OrderDetailClient.tsx` dòng 64: `new Date(order.created_at).toLocaleString('vi-VN')` -> `formatOrderDate(order.created_at, locale, { withTime: true })`. `locale` đã có ở dòng 25.
- `report.md` của task: ghi việc bỏ giây ở trang chi tiết và định dạng đã chốt (cùng mọi lệch ICU nếu có).

Cố ý không làm:

- Không đụng `formatDate`/`formatDateTime` trong `src/shared/utils/utils.ts` (date-fns, cố định `vi`).
- Không đụng checkout, trang tra cứu đơn, chuỗi tiếng Việt cứng khác, `src/lib/api/**`.
- Không sửa `OrdersClient.test.tsx` / `OrderDetailClient.test.tsx` (hiện không assert chuỗi ngày, nên không cần sửa).
- Không tạo barrel `index.ts`. Import bằng `@/features/orders/formatOrderDate`.

## Seams kiểm thử

- **`formatOrderDate` (unit, không mock)**: luôn truyền `timeZone: 'UTC'`. Input cố định, ví dụ `'2024-03-05T14:07:09Z'` (ngày/tháng có một chữ số để thấy được padding, giờ khác 12 để kiểm 24h, có giây để kiểm việc bỏ giây).
  - `vi` chỉ ngày; `vi` có `withTime`.
  - `en` chỉ ngày; `en` có `withTime`.
  - Locale lạ (`'fr'`, `''`) cho cùng kết quả với `vi`.
  - ISO sai (`'not-a-date'`, `''`) trả `''`, không ném lỗi.
  - Có giờ: kết quả không chứa `09` (giây) và không có `AM/PM`.
  - Giá trị mong đợi: chạy test một lần bằng `pnpm exec vitest run src/features/orders/formatOrderDate.test.ts`, lấy chuỗi thật Node trả ra rồi hard-code, kèm comment ghi định dạng đã chốt (ví dụ `// vi-VN: dd/MM/yyyy; en-GB: dd/MM/yyyy`). Nếu ICU cho dấu phân cách khác giữa các máy/CI, đổi sang so với `new Intl.DateTimeFormat('vi-VN', sameOptions).format(date)` tính trong test và ghi vào `report.md`.
- **`OrdersClient` / `OrderDetailClient` (RTL + MSW, có sẵn)**: chỉ chạy lại để xác nhận vẫn xanh, không thêm test mới.

## Các bước

1. [ ] TDD helper: viết `formatOrderDate.test.ts` (đỏ), rồi `formatOrderDate.ts`:
   - Map `const INTL_LOCALE = { vi: 'vi-VN', en: 'en-GB' } as const`; locale khác -> `'vi-VN'` (lookup có kiểm khóa an toàn kiểu, không dùng `any`).
   - `const date = new Date(iso)`; nếu `Number.isNaN(date.getTime())` thì trả `''`.
   - Options: `{ day: '2-digit', month: '2-digit', year: 'numeric', timeZone }`; với `withTime` thêm `hour: '2-digit', minute: '2-digit', hourCycle: 'h23'` (không có `second`). Bỏ `timeZone` khi là `undefined` để dùng múi giờ của trình duyệt.
   - `new Intl.DateTimeFormat(tag, opts).format(date)`.
   - Điền giá trị mong đợi từ kết quả chạy thật (xem Seams). `pnpm exec vitest run src/features/orders/formatOrderDate.test.ts` xanh.
2. [ ] `OrdersClient.tsx`: import `formatOrderDate` từ `@/features/orders/formatOrderDate` (đúng thứ tự import theo `typescript-react.md`), thay lời gọi ở dòng 52 (chỉ ngày). Chạy `pnpm exec vitest run src/features/orders/order-list/components/OrdersClient.test.tsx`.
3. [ ] `OrderDetailClient.tsx`: tương tự, thay dòng 64 bằng `{ withTime: true }`. Chạy `pnpm exec vitest run src/features/orders/order-detail/components/OrderDetailClient.test.tsx`.
4. [ ] Kiểm tra AC3: không còn `toLocaleString('vi-VN')` / `toLocaleDateString('vi-VN')` trong `src/features/orders/**` (dùng công cụ Grep).
5. [ ] Ghi `report.md`: bỏ giây ở trang chi tiết là chủ ý; định dạng đã chốt cho `vi`/`en`; lệch ICU nếu có.
6. [ ] Chạy gate: `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test`, `pnpm build`.

Đối chiếu tiêu chí nghiệm thu: AC1 -> bước 1; AC2 -> bước 1 (luôn truyền `timeZone`, giá trị lấy từ lần chạy thật); AC3 -> bước 2, 3, 4; AC4 -> bước 2, 3; AC5 -> bước 6.

## Rủi ro

- `vi-VN` và `en-GB` có thể cho ra chuỗi ngày giống nhau (`dd/MM/yyyy`). Spec chấp nhận điều này; test vẫn khóa cả hai nhánh, và chỗ khác biệt thật sẽ nằm ở phần giờ (`vi-VN` có thể đặt giờ trước ngày hoặc dùng dấu phân cách khác). Ghi định dạng thật vào test và `report.md`.
- Phiên bản ICU khác nhau giữa các bản Node có thể đổi dấu phân cách hoặc ký tự khoảng trắng (ví dụ NBSP). Có phương án dự phòng ở mục Seams.
- `formatOrderDate` chạy trong Client Component, không truyền `timeZone`, nên server và client có thể lệch múi giờ khi hydrate. Hành vi này giống `toLocale*String` hiện tại, không làm tệ hơn và không xử lý trong task này.
- Không có file deny/ask nào bị đụng; mọi lệnh đều nằm trong `allowCommands`.
