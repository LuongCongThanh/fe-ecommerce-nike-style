# Manifest phạm vi — Phạm vi Git hook

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng đường dẫn hiện hành thay vì path cũ. Đây không phải approved.files hay quyền sửa mọi file; spec là nguồn chuẩn về phạm vi và acceptance criteria. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `.husky/pre-commit`
- `.husky/pre-push`

## Consumer trực tiếp hiện tại ngoài owner

- `CONTRIBUTING.md` (đoạn "Before every commit…", dòng 30)
- `.claude/rules/process/git-workflow.md` (mục "Pre-commit checks", dòng 82; chỉ sửa trong phiên tương tác có người)

## Config/docs cần đối chiếu

- `.husky/commit-msg`, `lint-staged.config.mjs`, `.github/workflows/ci.yml`: chỉ đối chiếu, ngoài phạm vi sửa

## Test cũ được thích ứng trong scope

- Không có. `allow-test-changes: false`; test hiện có chỉ chạy để kiểm, không sửa.

## Giao nhau với task khác

- Task 30 sửa `lint-staged.config.mjs`, thứ duy nhất pre-commit còn chạy sau task 25. Hai task cùng có thể sửa `CONTRIBUTING.md`; task merge sau rebase.
