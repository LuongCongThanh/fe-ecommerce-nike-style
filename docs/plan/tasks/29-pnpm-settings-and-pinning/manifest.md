# Manifest phạm vi — Cấu hình và pin pnpm

Snapshot tham chiếu ngày 25/11/2026, dựa trên spec hiện có. Rà lại đường dẫn, consumer và diff khi lập plan, đặc biệt sau các blocker. Danh sách này không phải approved.files và không cấp quyền sửa file; spec là nguồn chuẩn về phạm vi và điều kiện nghiệm thu.

## File và consumer cần đối chiếu

`.npmrc`, `pnpm-workspace.yaml`, `package.json`, `pnpm-lock.yaml`.

## Kiểm tra và giới hạn

Ghi bằng chứng cài thử trong thư mục nháp và so sánh dependency/lockfile trước sau; không đổi phiên bản resolved.

## Giao nhau và bàn giao

Đối chiếu thay đổi Sentry và ESLint đã hoàn thành; không sửa overrides ngoài scope. Giữ status, identity và blocker hiện có; ghi phát hiện và kết quả thực tế vào report khi thực hiện.
