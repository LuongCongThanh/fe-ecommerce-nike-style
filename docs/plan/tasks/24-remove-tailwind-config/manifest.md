# Manifest phạm vi — Gỡ cấu hình Tailwind cũ

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng đường dẫn hiện hành thay vì path cũ. Đây không phải approved.files hay quyền sửa mọi file; spec là nguồn chuẩn về phạm vi và acceptance criteria. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `tailwind.config.ts` (xoá)

## Consumer trực tiếp hiện tại ngoài owner

- Không có code import. Glob `tailwind.config.*` trong `eslint.config.mjs` (dòng 453) và `eslint.base.mjs` (dòng 64) được giữ theo spec.

## Config/docs cần đối chiếu

- `src/styles/globals.css`, `src/styles/theme.css`, `src/styles/preset.css`, `src/styles/login.css`: chỉ rà `@config`, không sửa

## Test cũ được thích ứng trong scope

- Không có. `allow-test-changes: false`; test hiện có chỉ chạy để kiểm, không sửa.

## Giao nhau với task khác

- Task 27 xoá `eslint.base.mjs` và viết lại `eslint.config.mjs`. Glob `tailwind.config.*` thuộc quyết định của 27; task 24 không sửa ESLint.
