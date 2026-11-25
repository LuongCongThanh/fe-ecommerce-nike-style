# Manifest phạm vi — Phạm vi Git hook

Snapshot tham chiếu ngày 25/11/2026, dựa trên spec hiện có. Rà lại đường dẫn, consumer và diff khi lập plan, đặc biệt sau các blocker. Danh sách này không phải approved.files và không cấp quyền sửa file; spec là nguồn chuẩn về phạm vi và điều kiện nghiệm thu.

## File và consumer cần đối chiếu

`.husky/pre-commit`, `.husky/pre-push`, `.husky/commit-msg`, `lint-staged.config.mjs`, `CONTRIBUTING.md`, `.claude/rules/process/git-workflow.md`.

## Kiểm tra và giới hạn

Đối chiếu nội dung hook và tài liệu; kiểm chứng theo spec mà không tự tạo commit hoặc push.

## Giao nhau và bàn giao

Rule Git workflow cần phiên tương tác với người; commit-msg và lint-staged ngoài phạm vi sửa. Giữ status, identity và blocker hiện có; ghi phát hiện và kết quả thực tế vào report khi thực hiện.
