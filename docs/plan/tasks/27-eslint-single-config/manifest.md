# Manifest phạm vi — Gộp ESLint

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng đường dẫn hiện hành thay vì path cũ. Đây không phải approved.files hay quyền sửa mọi file; spec là nguồn chuẩn về phạm vi và acceptance criteria. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `eslint.config.mjs`
- `eslint.base.mjs` (xoá)

## Config/docs cần đối chiếu

- `package.json` và `pnpm-lock.yaml` (chỉ qua `pnpm add -D` / `pnpm remove`)

## File mẫu cho `--print-config`

- `src/features/auth/components/PasswordInput.tsx`
- `src/features/auth/components/PasswordInput.test.tsx`
- `src/lib/api/mocks/catalog-fixtures.ts`
- `next.config.ts` (chỉ làm mẫu, không sửa)

## Test cũ được thích ứng trong scope

- Không có. `allow-test-changes: false`; test hiện có chỉ chạy để kiểm, không sửa. Không sửa source để thoả rule mới.

## Giao nhau với task khác

- Task 24: giữ glob `tailwind.config.*` khi gộp hai file ESLint.
- Task 29: pin phiên bản dependency; task merge sau rebase và pin phần devDependency còn lại.
- Task 23, 26: cùng sửa `package.json`; 23 cũng đổi `pnpm-lock.yaml`.
- Task 30: Prettier và lint-staged thuộc task 30, ngoài phạm vi 27.
