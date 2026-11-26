---
status: ready-for-agent
blocked-by: []
pr:
kind: ui
approved:
  files: []
  commands: []
retro-turns:
allow-test-changes:
---

# Spec 04: Nhãn trạng thái đơn hàng theo i18n

Branch: `feat/04-order-status-badge-i18n`

## Mục tiêu

`OrderStatusBadge` ghi cứng nhãn tiếng Việt ("Chờ xác nhận", "Đã giao"...), nên người dùng `en` thấy nhãn tiếng Việt ở danh sách và chi tiết đơn. Chuyển nhãn sang next-intl (`namespace order`) cho cả `vi` và `en`, giữ nguyên biến thể màu `Badge`.

## Phạm vi

Trong phạm vi:

- `src/features/orders/components/OrderStatusBadge.tsx`: đổi `STATUS_MAP` thành bản đồ `OrderStatus -> variant` (giữ y các variant hiện tại), lấy nhãn bằng `useTranslations('order')` với khóa `statusLabels.<STATUS>`.
- `src/lang/vi/order.json` và `src/lang/en/order.json`: thêm object `statusLabels` đủ 8 trạng thái (`PENDING`, `PROCESSING`, `PACKED`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `RETURN_REQUESTED`, `RETURNED`). Nhãn `vi` giữ đúng chữ hiện tại; nhãn `en` tự soạn ngắn gọn (ví dụ "Pending confirmation", "Processing", "Packed", "Shipped", "Delivered", "Cancelled", "Return requested", "Returned").
- `src/features/orders/components/OrderStatusBadge.test.tsx` (mới): render qua `renderWithProviders` (`src/helpers/render.tsx`, locale `vi`) cho cả 8 trạng thái; thêm một ca render với `NextIntlClientProvider locale="en"` nạp `src/lang/en/order.json`. Một test đối chiếu tập khóa `statusLabels` của `vi` và `en` phải bằng nhau.

Ngoài phạm vi: `Badge.tsx`, `OrdersClient`, `OrderDetailClient` (các chuỗi cứng khác như "Đơn #", "Tổng cộng"), checkout, `src/lib/api/**`, `src/shared/types/order.ts`, `src/i18n/**`.

## Tiêu chí nghiệm thu

- [ ] `OrderStatusBadge` không còn chuỗi tiếng Việt cứng; chữ hiển thị đến từ `statusLabels`.
- [ ] Cả 8 trạng thái hiển thị đúng chữ `vi` hiện tại và đúng chữ `en` khi locale là `en`.
- [ ] Mỗi trạng thái vẫn dùng đúng variant cũ (`secondary`, `info`, `warning`, `default`, `success`, `destructive`, `outline`, `secondary`); không thêm biến thể hay màu mới, không hex cứng.
- [ ] Test đối chiếu khóa `vi`/`en` xanh; thêm một trạng thái vào type mà thiếu nhãn phải làm `pnpm typecheck` hoặc test đỏ (bản đồ variant kiểu `Record<OrderStatus, ...>` giữ nguyên).
- [ ] Test hiện có của `OrdersClient` và `OrderDetailClient` vẫn xanh, không sửa nội dung test.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check` xanh (file JSON qua Prettier).

## Ghi chú/rủi ro

- Rủi ro thấp: đổi nguồn chuỗi, không đổi logic trạng thái hay luồng đặt/hủy đơn.
- Nếu `src/lang/*/order.json` thiếu quyền ghi trong lượt chạy (guard), dừng và báo `needs_approval`; không tự đổi chỗ đặt khóa.
- `README` agent nêu storefront hỗ trợ hai ngôn ngữ: task này chỉ vá một component, không tuyên bố hoàn tất i18n cho đơn hàng.

## Comments

### 18/11/2026 — Cập nhật sau rà ranh giới source

shared/types/order.ts đã được gỡ vì chỉ re-export. OrderStatusBadge hiện dùng StorefrontOrderStatus trực tiếp từ lib/api/endpoints/orders; triển khai i18n trên component hiện tại, không tạo lại alias cũ.
