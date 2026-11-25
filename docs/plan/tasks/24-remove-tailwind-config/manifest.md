# Manifest phạm vi — Gỡ cấu hình Tailwind cũ

Snapshot tham chiếu ngày 25/11/2026, dựa trên spec hiện có. Rà lại đường dẫn, consumer và diff khi lập plan, đặc biệt sau các blocker. Danh sách này không phải approved.files và không cấp quyền sửa file; spec là nguồn chuẩn về phạm vi và điều kiện nghiệm thu.

## File và consumer cần đối chiếu

`tailwind.config.ts`, `src/styles/globals.css`, `src/styles/theme.css`, `eslint.config.mjs`, `eslint.base.mjs`.

## Kiểm tra và giới hạn

Chỉ xóa config theo spec; rà `@config` và so sánh CSS build trước/sau.

## Giao nhau và bàn giao

Các file CSS và ESLint là đối chiếu, không mở rộng phạm vi sửa. Giữ status, identity và blocker hiện có; ghi phát hiện và kết quả thực tế vào report khi thực hiện.
