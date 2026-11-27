---
status: done
blocked-by: []
pr: 94
kind: refactor
approved:
  files: []
  commands: []
retro-turns:
allow-test-changes:
---

# Spec 05: Xóa hằng số chết trong `app-config.ts`

Branch: `refactor/05-remove-dead-app-config`

## Mục tiêu

`src/shared/constants/app-config.ts` còn các export không ai dùng và đã lệch hệ thống: `ORDER_STATUS_LABEL` (trạng thái `confirmed`/chữ thường, không khớp enum đơn hiện tại), `PAYMENT_METHOD_LABEL`, `ORDER_STATUS_COLOR_MAP` (màu Tailwind cứng ngoài token của `design.md`), `SORT_OPTIONS` và `SortOption`. Xóa chúng để người đọc (và agent) không lấy nhầm làm nguồn sự thật. Không đổi hành vi.

## Phạm vi

Trong phạm vi:

- `src/shared/constants/app-config.ts`: xóa năm export nói trên; **giữ nguyên** `APP_CONFIG` (còn được `src/shared/types/filter.ts` dùng).

Ngoài phạm vi: mọi file khác, kể cả `docs/storefront/plan/storefront-current-file-tree.md` (bảng kiểm kê, cập nhật ở PR dọn tài liệu riêng), `MAX_CART_QUANTITY` và các khóa `APP_CONFIG` còn lại, mọi test.

## Tiêu chí nghiệm thu

- [ ] Trước khi xóa, `grep -rnE "ORDER_STATUS_LABEL|PAYMENT_METHOD_LABEL|ORDER_STATUS_COLOR_MAP|SORT_OPTIONS|SortOption" src e2e scripts` chỉ trả về chính `app-config.ts` (ghi kết quả vào `report.md`); nếu có consumer khác thì dừng và hỏi, không tự sửa consumer.
- [ ] Sau khi xóa, grep trên rỗng; `APP_CONFIG` giữ nguyên giá trị.
- [ ] Diff chỉ gồm một file, chỉ xóa dòng.
- [ ] Không có test nào bị sửa, xóa hay thêm (`allow-test-changes` để trống); toàn bộ test hiện có xanh.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check`, `pnpm build` xanh.

## Ghi chú/rủi ro

- Rủi ro rất thấp: chỉ xóa export không có consumer; trình biên dịch sẽ báo ngay nếu sót.
- Là task refactor nên Stop hook chỉ yêu cầu test liên quan xanh, không đòi test mới (D38).

## Comments

### 18/11/2026 — Cập nhật sau rà ranh giới source

shared/types/filter.ts đã được gỡ sau khi xác nhận không còn consumer. Bằng chứng APP_CONFIG có consumer trong plan cũ không còn đúng; cần rà lại consumer và phạm vi trước triển khai. Phiên này không sửa app-config.ts hoặc trạng thái task.
