# Manifest phạm vi — Gỡ guard admin

Snapshot tham chiếu ngày 25/11/2026, dựa trên spec hiện có. Rà lại đường dẫn, consumer và diff khi lập plan, đặc biệt sau các blocker. Danh sách này không phải approved.files và không cấp quyền sửa file; spec là nguồn chuẩn về phạm vi và điều kiện nghiệm thu.

## File và consumer cần đối chiếu

`src/proxy.ts`, `src/proxy.test.ts` (sau task 32), `src/shared/constants/auth-cookies.ts`, `e2e/checkout.spec.ts`, `e2e/auth.spec.ts`.

## Kiểm tra và giới hạn

Trước sửa rà route admin và consumer cookie, kể cả backend nếu checkout có mặt; test chỉ đổi phần admin như spec.

## Giao nhau và bàn giao

Phụ thuộc task 32; generated API và order transitions ngoài scope. Giữ status, identity và blocker hiện có; ghi phát hiện và kết quả thực tế vào report khi thực hiện.
