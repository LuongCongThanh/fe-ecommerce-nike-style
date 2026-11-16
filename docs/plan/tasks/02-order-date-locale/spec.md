---
status: review
blocked-by: []
pr: #97
kind: logic
approved:
  files: []
  commands: []
retro-turns:
allow-test-changes:
---

# Spec 02: Định dạng ngày đơn hàng theo locale

Branch: `feat/02-order-date-locale`

## Mục tiêu

`OrdersClient` và `OrderDetailClient` gọi `toLocaleDateString('vi-VN')` / `toLocaleString('vi-VN')` cứng, nên người dùng `en` vẫn thấy ngày kiểu Việt dù storefront hỗ trợ hai ngôn ngữ. Thêm helper thuần `formatOrderDate` nhận locale của app và dùng ở hai màn hình này.

## Phạm vi

Trong phạm vi:

- `src/features/orders/formatOrderDate.ts` (mới): `formatOrderDate(iso: string, locale: string, options?: { withTime?: boolean; timeZone?: string }): string`. Dùng `Intl.DateTimeFormat`; `vi` -> `vi-VN`, `en` -> `en-GB`, locale lạ rơi về `vi-VN`. `withTime` thêm giờ:phút (24h, không giây). Chuỗi ISO không hợp lệ trả `''` thay vì ném lỗi hay in `Invalid Date`.
- `src/features/orders/formatOrderDate.test.ts` (mới): truyền `timeZone: 'UTC'` để test không phụ thuộc máy; kiểm `vi`, `en`, có/không giờ, locale lạ, ISO sai.
- `src/features/orders/order-list/components/OrdersClient.tsx` và `src/features/orders/order-detail/components/OrderDetailClient.tsx`: thay hai lời gọi `toLocale*String('vi-VN')` bằng `formatOrderDate(order.created_at, locale, ...)` (cả hai đã có `useLocale()`); danh sách chỉ hiện ngày, chi tiết hiện ngày và giờ.

Ngoài phạm vi: `formatDate`/`formatDateTime` trong `src/shared/utils/utils.ts` (không đụng), checkout, trang tra cứu đơn, chuỗi tiếng Việt cứng khác, `src/lib/api/**`.

## Tiêu chí nghiệm thu

- [ ] `formatOrderDate` là hàm thuần; mọi nhánh (`vi`, `en`, locale lạ, `withTime`, ISO sai) có test.
- [ ] Test chạy ổn định bất kể múi giờ máy (luôn truyền `timeZone`). Giá trị mong đợi lấy từ kết quả chạy thật của Node trong repo, không đoán; ghi rõ định dạng chốt trong test.
- [ ] Không còn `toLocaleString('vi-VN')` / `toLocaleDateString('vi-VN')` trong `src/features/orders/**`.
- [ ] Test hiện có của `OrdersClient` và `OrderDetailClient` vẫn xanh mà không sửa nội dung test.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check` xanh.

## Ghi chú/rủi ro

- Hiển thị giờ ở trang chi tiết bỏ phần giây so với trước: chủ ý, ghi vào `report.md`.
- Khác biệt ICU giữa các phiên bản Node có thể đổi dấu phân cách; nếu test lệch, ưu tiên so khớp bằng `Intl.DateTimeFormat(...).format` tính trong test thay vì chuỗi cứng, và báo trong `report.md`.
- Không đụng checkout hay dữ liệu đơn hàng; chỉ đổi cách hiển thị một trường.
