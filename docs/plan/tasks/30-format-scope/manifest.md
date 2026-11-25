# Manifest phạm vi — Phạm vi Prettier

Snapshot tham chiếu ngày 25/11/2026, dựa trên spec hiện có. Rà lại đường dẫn, consumer và diff khi lập plan, đặc biệt sau các blocker. Danh sách này không phải approved.files và không cấp quyền sửa file; spec là nguồn chuẩn về phạm vi và điều kiện nghiệm thu.

## File và consumer cần đối chiếu

`lint-staged.config.mjs`, `package.json`, `.prettierignore`, `CONTRIBUTING.md`, `scripts/check-docs.ts`.

## Kiểm tra và giới hạn

Kiểm kê glob, danh sách file thực tế và thử Markdown/YAML theo spec; dừng khi vượt ngưỡng 20 file.

## Giao nhau và bàn giao

Docs checker chỉ đối chiếu; tránh thay đổi skill mirror hoặc định dạng hàng loạt ngoài scope. Giữ status, identity và blocker hiện có; ghi phát hiện và kết quả thực tế vào report khi thực hiện.
