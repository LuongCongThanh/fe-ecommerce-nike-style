# Manifest phạm vi — Gộp ESLint

Snapshot tham chiếu ngày 25/11/2026, dựa trên spec hiện có. Rà lại đường dẫn, consumer và diff khi lập plan, đặc biệt sau các blocker. Danh sách này không phải approved.files và không cấp quyền sửa file; spec là nguồn chuẩn về phạm vi và điều kiện nghiệm thu.

## File và consumer cần đối chiếu

`eslint.config.mjs`, `eslint.base.mjs`, `package.json`, `pnpm-lock.yaml`, `next.config.ts`.

## Kiểm tra và giới hạn

Chọn bốn file mẫu thực tế theo spec gồm TSX, test TSX, mock API và Next config; lưu print-config và timing trước/sau.

## Giao nhau và bàn giao

Giao nhau dependency với task pnpm và rule migration; không sửa source để đáp ứng rule mới. Giữ status, identity và blocker hiện có; ghi phát hiện và kết quả thực tế vào report khi thực hiện.
