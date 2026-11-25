# Manifest phạm vi — Pin Node

Snapshot tham chiếu ngày 25/11/2026, dựa trên spec hiện có. Rà lại đường dẫn, consumer và diff khi lập plan, đặc biệt sau các blocker. Danh sách này không phải approved.files và không cấp quyền sửa file; spec là nguồn chuẩn về phạm vi và điều kiện nghiệm thu.

## File và consumer cần đối chiếu

`.nvmrc` (dự kiến tạo), `package.json`, `.github/workflows/ci.yml`, `README.md`, `pnpm-lock.yaml`.

## Kiểm tra và giới hạn

Rà mọi setup-node trong workflow và xác minh frozen install; lockfile là đối tượng kiểm tra không đổi.

## Giao nhau và bàn giao

Giao nhau CI với task env; không nâng Node hoặc bật engine-strict. Giữ status, identity và blocker hiện có; ghi phát hiện và kết quả thực tế vào report khi thực hiện.
