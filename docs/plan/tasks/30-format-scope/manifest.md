# Manifest phạm vi — Phạm vi Prettier

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng đường dẫn hiện hành thay vì path cũ. Đây không phải approved.files hay quyền sửa mọi file; spec là nguồn chuẩn về phạm vi và acceptance criteria. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `lint-staged.config.mjs`
- `package.json` (scripts `format`, `format:check`)
- `.prettierignore`

## Consumer trực tiếp hiện tại ngoài owner

- `.github/workflows/ci.yml` dòng 43 (`pnpm run format:check`): chỉ đối chiếu
- `.husky/pre-commit` (`pnpm lint-staged`): chỉ đối chiếu

## Config/docs cần đối chiếu

- `CONTRIBUTING.md` nếu mô tả lệnh format
- `README.md` dòng 33 và `.claude/rules/process/testing.md` dòng 167 nhắc `format:check`: chỉ đối chiếu
- `scripts/check-docs.ts`, `.prettierrc.mjs`: ngoài phạm vi, không sửa

## Test cũ được thích ứng trong scope

- Không có. `allow-test-changes: false`; test hiện có chỉ chạy để kiểm, không sửa.

## Giao nhau với task khác

- Task 25: sau 25, pre-commit chỉ chạy `lint-staged`; hai task có thể cùng sửa `CONTRIBUTING.md`.
- Task 27: script `format` bỏ ESLint; `lint:fix` dùng config sau task 27.
