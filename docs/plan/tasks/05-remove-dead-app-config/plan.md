# Plan 05: Xóa hằng số chết trong `app-config.ts`

Branch: `refactor/05-remove-dead-app-config` (từ `dev`). Một PR, không có breaking change (chỉ xóa export không có consumer).

## Phạm vi

Sửa đúng một file:

- `src/shared/constants/app-config.ts`: xóa dòng 8–40 (`ORDER_STATUS_LABEL`, `PAYMENT_METHOD_LABEL`, `ORDER_STATUS_COLOR_MAP`, `SORT_OPTIONS`, `type SortOption`) cùng dòng trống phía trước. **Giữ nguyên** khối `APP_CONFIG` (dòng 1–6), từng giá trị không đổi.

Ghi thêm: `docs/plan/tasks/05-remove-dead-app-config/report.md` (kết quả tìm kiếm trước/sau, theo tiêu chí nghiệm thu; file task, không tính vào diff code).

Đã kiểm tra lúc lập plan: tìm `ORDER_STATUS_LABEL|PAYMENT_METHOD_LABEL|ORDER_STATUS_COLOR_MAP|SORT_OPTIONS|SortOption` trên toàn repo (trừ `docs/`) chỉ ra chính `app-config.ts`. Consumer duy nhất của file là `src/shared/types/filter.ts` (import `APP_CONFIG`) — không bị ảnh hưởng.

Cố ý không làm: sửa `src/shared/types/filter.ts`, `docs/plan/storefront-current-file-tree.md`, `MAX_CART_QUANTITY`/các khóa khác của `APP_CONFIG`, bất kỳ test nào; không thêm thay thế (label/sort mới).

## Seams kiểm thử

- Không thêm/sửa/xóa test (`kind: refactor`, `allow-test-changes` trống).
- Seam là trình biên dịch + bộ test hiện có: `pnpm typecheck` bắt mọi import sót; `pnpm test` chứng minh `APP_CONFIG` (qua `src/shared/types/filter.ts` và consumer của nó) không đổi hành vi.
- Kiểm tra tĩnh: công cụ Grep (không dùng `grep` qua Bash, vì ngoài `allowCommands`) với pattern của spec trên `src`, `e2e`, `scripts`.

## Các bước

1. [ ] Trước khi sửa: dùng công cụ Grep với pattern `ORDER_STATUS_LABEL|PAYMENT_METHOD_LABEL|ORDER_STATUS_COLOR_MAP|SORT_OPTIONS|SortOption` trên `src`, `e2e`, `scripts`; ghi kết quả vào `report.md`. Nếu có match ngoài `src/shared/constants/app-config.ts` → dừng, báo cáo, không sửa consumer. (AC1)
2. [ ] Xóa năm export (dòng 8–40) trong `src/shared/constants/app-config.ts`; file còn lại đúng khối `APP_CONFIG` kết thúc bằng một newline. Chỉ xóa dòng, không reformat. (AC2, AC3)
3. [ ] Grep lại cùng pattern → rỗng; ghi kết quả vào `report.md`. Đọc lại file xác nhận `APP_CONFIG` y nguyên. (AC2)
4. [ ] Chạy gate: `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test`, `pnpm build`. Ghi kết quả vào `report.md`. (AC4, AC5)

## Rủi ro

- Rất thấp: không có consumer; typecheck báo ngay nếu sót.
- `docs/plan/storefront-current-file-tree.md` (và có thể tài liệu khác) vẫn nhắc các hằng số này — cố ý để PR dọn tài liệu riêng xử lý.
- Không chạm path deny/ask nào; mọi lệnh gate nằm trong `allowCommands`.
